#include <Servo.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <string>
#include <sstream>
#include "EspMQTTClient.h"
SoftwareSerial ESPserial(13, 15); //RX (D7), TX(D8)  

EspMQTTClient client(
  "ABB_Indgym",
  "7Laddaremygglustbil",
  "maqiatto.com",  // MQTT Broker server ip
  "kevin.klarin@abbindustrigymnasium.se",   // Can be omitted if not needed
  "1337",   // Can be omitted if not needed
  "SmoothRabbits 1"      // Client name that uniquely identify your device
);

byte Pwm_b = 5; //D1
byte Dir_b1 = 0; //D3

unsigned long previousMillis = 0;
unsigned long currentMillis = 0;
unsigned long diffMillis = 0;

float propfault;
int roadtype;
int orientation = 1;
float fault;
int turnrate;
String message;
bool launch = false;
bool hold = false;

int speeed = 200;

char instruction[] = {};

typedef enum DriveStates{
Drive,
Stop,
Wait,
Lego,
Pick,
Right,
Left
};

DriveStates DState;

boolean TimeLimit(int interval){
  currentMillis = millis();
  diffMillis = currentMillis - previousMillis;
  if(diffMillis > interval) {
    return true;
  }
  else return false;
}


Servo turnservo;
Servo raiseservo;
Servo clawservo;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  ESPserial.begin(115200);
  pinMode(13,INPUT); //D7
  pinMode(15,OUTPUT); //D8
  
  turnservo.attach(4); //D2
  raiseservo.attach(14); //D5
  clawservo.attach(12); //D6
  pinMode(Pwm_b, OUTPUT);
  pinMode(Dir_b1, OUTPUT);
  analogWrite(Pwm_b, 0);

  DState = Stop;

  client.enableLastWillMessage("kevin.klarin@abbindustrigymnasium.se/lmaoxd", "am ded");
}

void onConnectionEstablished() {
  Serial.println("connected");
  client.subscribe("kevin.klarin@abbindustrigymnasium.se/speed", [] (const String &payload)  {
    char subcharacter;
    subcharacter = payload[0];
    //Serial.println(subcharacter);
    if (isdigit(subcharacter)) {
      orientation = payload.toInt();
      if (DState == Stop) {
        Serial.println(payload);
        DState = Drive;
      }
      else {
        DState = Stop; 
      }
    }
    else {
      payload.toCharArray(instruction, 20);  
    }
    //Serial.println(payload);
  });
}

void loop() {
  int roadtype;
  int orientation = 1;
  String content = "";
  char character;
  char sign;
  client.loop();
  switch (DState) {
    case Stop:
      digitalWrite(LED_BUILTIN, HIGH);
      //Serial.println("Stop");
      speeed = 0;
      turnrate = 90;
    break;
    case Drive:
      digitalWrite(LED_BUILTIN, HIGH);
      //Serial.println("Drive");
      speeed = 300;
      while (ESPserial.available()) {
          //Serial.println("Device detected");
          character = ESPserial.read();                                 
          content.concat(character);
      }
      if (content != "") {
        //Serial.println("message: " + content); 
        character = content[0];
        //Serial.println(character);
        if (isdigit(character) || character == '-')
        {
          //Serial.print("content: ");
          //Serial.println(content);
          fault = content.toInt();
        }
      else {
        Serial.print("message: ");
        Serial.println(character);
        if (character == 'm'){
          previousMillis = millis();
          DState = Lego;
          break;
        }
        else if (character == 'n'){
          if (not hold){
            DState = Pick;
          }  
          break;
        }
        else if (character == 'l'){
          Serial.println("Wait");
          DState = Wait;
          break;
        }
        else {
          roadtype = character - 'a';
          if (roadtype >= 0 && roadtype <= 10) {
            //Serial.print("character: ");
            //Serial.println(character);
            message = String(orientation) + " " + String(roadtype);
            //Serial.println("letter: " + message);
            client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd", message);
            }
          }
        }
        //Serial.println(content);
      }
    
      //Reglering för styrningen
        if (fault > 0) {
          propfault = fault / 160;
          turnrate = 110 + (35 * propfault);
        }
        else if (fault < 0){ 
          propfault = fault / 160;
          turnrate = 70 + (35 * propfault);
        }
    break;
    case Wait:
      turnrate = 90;
      speeed = 0;
      while (ESPserial.available()) {
          //Serial.println("Device detected");
          character = ESPserial.read();                                 
          content.concat(character);
        }
        if (content != "") {
          sign = content[0];
          //Serial.println("Wait: " + content + " yeet: " + content[0]); 
          Serial.println("Text: " + sign);
          if (not isdigit(sign) || sign != '-') {
            roadtype = sign - 'a';
            if (roadtype >= 0 && roadtype <= 10) {
              //Serial.print("character: ");
              //Serial.println(character);
              message = String(orientation) + " " + String(roadtype);
              //Serial.println("letter: " + message);
              client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd", message);
              delay(100);
              if (roadtype == 5){
                analogWrite(Pwm_b, 0);
                DState = Left;
              }
              else if (roadtype == 4){
                analogWrite(Pwm_b, 0);
                DState = Right;
              }
              else {
                DState = Drive;
              }
              break;
            }
          }
        }
      break;
      case Lego:
        Serial.println("Lego");
        speeed = 0;
        digitalWrite(LED_BUILTIN, LOW);
        while (ESPserial.available()) {
          //Serial.println("Device detected");
          character = ESPserial.read();                                 
          content.concat(character);
        }
        if (content != "") {
          Serial.println(content);
          if (content != "m") {
            if (TimeLimit(1000)) {
              digitalWrite(LED_BUILTIN, HIGH);
              DState = Drive;
            }
          }
          else {
            previousMillis = millis();
          }
        }
      break;
      case Pick:
        analogWrite(Pwm_b, 0);
        raiseservo.write(0);
        clawservo.write(0);
        delay(500);
        analogWrite(Pwm_b, 325);
        delay(1000);
        analogWrite(Pwm_b, 0);
        clawservo.write(180);
        delay(500);
        raiseservo.write(180);
        digitalWrite(Dir_b1, HIGH);
        analogWrite(Pwm_b, 325);
        delay(1000);
        hold = true;
        DState = Drive;
      break;
      case Right:
        ESPserial.write("t");
        Serial.println("Right");
        analogWrite(Pwm_b, 325);
        delay(2700);
        analogWrite(Pwm_b, 0);
        turnservo.write(180);
        delay(1000);
        turnservo.write(90);
        analogWrite(Pwm_b, 325);
        delay(1300);
        turnservo.write(180);
        analogWrite(Pwm_b, 0);
        delay(1200);
        turnservo.write(90);
        digitalWrite(Dir_b1, HIGH);
        analogWrite(Pwm_b, 325);
        delay(1000);
        analogWrite(Pwm_b, 0);
        orientation += 1;
        if (orientation >= 5);{
          orientation = 1;
        }
        DState = Wait;
        ESPserial.write("d");
      break;
      case Left:
        ESPserial.write("t");
        Serial.println("Left");
        analogWrite(Pwm_b, 325);
        delay(2700);
        analogWrite(Pwm_b, 0);
        turnservo.write(0);
        delay(1000);
        turnservo.write(90);
        analogWrite(Pwm_b, 325);
        delay(1300);
        turnservo.write(0);
        analogWrite(Pwm_b, 0);
        delay(1200);
        turnservo.write(90);
        digitalWrite(Dir_b1, HIGH);
        analogWrite(Pwm_b, 325);
        delay(1000);
        analogWrite(Pwm_b, 0);
        orientation += -1;
        if (orientation <= 0);{
          orientation = 4;
        }
        DState = Wait;
        ESPserial.write("d");
      break;
        
  }
      

    //Serial.print("fault: ");
    //Serial.println(fault);
    //Serial.println(turnrate);
    raiseservo.write(180);
    turnservo.write(turnrate);
    clawservo.write(180);
    
    //Serial.println("state: " + DState);
    
    /*Serial.print("Propfault: ");
    Serial.println(propfault);
    Serial.print("fault: ");
    Serial.println(fault);
    Serial.print("Turnrate: ");
    Serial.println(turnrate);
    */
    //0 <- 71 <-> 111 -> 180
    //medurs        moturs
    digitalWrite(Dir_b1, LOW);
    analogWrite(Pwm_b, speeed);
};
