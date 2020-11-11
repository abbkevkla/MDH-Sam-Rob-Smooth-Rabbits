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
  "TestClient"      // Client name that uniquely identify your device
);

byte Pwm_b = 5; //D1
byte Dir_b1 = 0; //D3
float propfault;
int roadtype;
int orientation = 1;
float fault;
int turnrate;
String message;

Servo turnservo;
Servo raiseservo;

void setup() {
  Serial.begin(115200);
  ESPserial.begin(115200);
  pinMode(13,INPUT); //D7
  pinMode(15,OUTPUT); //D8
  
  turnservo.attach(4); //D2
  raiseservo.attach(14); //D5
  pinMode(Pwm_b, OUTPUT);
  pinMode(Dir_b1, OUTPUT);
  analogWrite(Pwm_b, 0);

}

void onConnectionEstablished() {
  Serial.println("connected");
  client.subscribe("kevin.klarin@abbindustrigymnasium.se/lmaoxd", [] (const String &payload)  {
    Serial.println(payload);
  });
}

void loop() {
  int roadtype;
  int orientation = 1;
  String content = "";
  char character;
  client.loop();
  while (ESPserial.available()) {
      //Serial.println("Device detected");
      character = ESPserial.read();                                    
      content.concat(character);
  }
  if (content != "") {
    character = content[0];
    //Serial.println(character);
    if (isdigit(character)) {
      fault = content.toInt();
      Serial.println("ye " + String(fault));
      }
    else {
      roadtype = character - 'a';
      if (roadtype > 0 && roadtype < 11) {
        Serial.print("character: ");
        Serial.println(character);
        message = String(orientation) + " " + String(roadtype);
        client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd", message);
        }
      }
    //Serial.println(content);
  }

  //Reglering för styrningen
  if (fault > 0) {
    propfault = fault / 160;
    turnrate = 110 + (70 * propfault);
  }
  else if (fault < 0){ 
    propfault = fault / 160;
    turnrate = 70 + (70 * propfault);
  }
  
  raiseservo.write(180);
  turnservo.write(90);
  
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
  analogWrite(Pwm_b, 600);
};
