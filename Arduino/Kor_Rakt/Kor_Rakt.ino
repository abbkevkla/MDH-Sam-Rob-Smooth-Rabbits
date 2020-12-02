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

float propfault;
int roadtype;
int orientation = 1;
float fault;
int turnrate;
String message;
bool launch = false;

int speeed = 200;

char instruction[] = {};

typedef enum DriveStates{
Drive,
Stop,
Wait
};

DriveStates DState;


Servo turnservo;
Servo raiseservo;
Servo clawservo;

void setup() {
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
  client.loop();
  switch (DState) {
    case Stop:
      Serial.println("Stop");
      speeed = 0;
      turnrate = 90;
    break;
    case Drive:
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
          if (abs(fault) < 30)
          Serial.println("ye " + String(fault));
          }
      else {
        //Serial.print("legggooooo ");
        Serial.println(character);
        if (character == 'l'){
           DState = Wait;
           break;
        }
        else {
          roadtype = character - 'a';
          if (roadtype >= 0 && roadtype <= 11) {
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
      //Serial.println("Wait");
      turnrate = 90;
      speeed = 0;
      while (ESPserial.available()) {
          //Serial.println("Device detected");
          character = ESPserial.read();                                 
          content.concat(character);
      }
      if (content != "") {
        //Serial.println("message: " + content); 
        character = content[0];
        //Serial.println(character);
        if(not isdigit(character) || character != '-') {
          //Serial.println(character);
          roadtype = character - 'a';
          if (roadtype >= 0 && roadtype <= 11) {
            //Serial.print("character: ");
            //Serial.println(character);
            message = String(orientation) + " " + String(roadtype);
            //Serial.println("letter: " + message);
            client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd", message);
            delay(100);
            DState = Drive;
            break;
            }
          }
        }
      break;
  }
      

    //Serial.print("fault: ");
    //Serial.println(fault);
    //Serial.println(turnrate);
    raiseservo.write(0);
    delay(1000);
    turnservo.write(90);
    clawservo.write(180);
    delay(1000);
    
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
