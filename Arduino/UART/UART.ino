#include <SoftwareSerial.h>
#include <ArduinoJson.h>
SoftwareSerial ESPserial(13, 15); //RX (D7), TX(D8)  
//Also connect GND between ESP and maix-dock

void setup() {
  Serial.begin(115200);
  ESPserial.begin(115200);
  pinMode(13,INPUT); //D7
  pinMode(15,OUTPUT); //D8
}

void loop() {
  String content = "";
  char character;
  
  while (ESPserial.available()) {
      //Serial.println("Device detected");
      character = ESPserial.read();                                    
      content.concat(character);
  }
  if (content != "") {
    Serial.println(content);
  }
}

