#include <Servo.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
SoftwareSerial ESPserial(13, 15); //RX (D7), TX(D8)  

byte Pwm_b = 5; //D1
byte Dir_b1 = 0; //D3
float propfault;
String content;
float fault;
int turnrate;

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

void loop() {
  String content = "";
  char character;
  while (ESPserial.available()) {
      //Serial.println("Device detected");
      character = ESPserial.read();                                    
      content.concat(character);
  }
  if (content != "") {
    //Serial.println(content);
    fault = content.toInt();
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
  turnservo.write(turnrate);
  Serial.print("Propfault: ");
  Serial.println(propfault);
  Serial.print("fault: ");
  Serial.println(fault);
  Serial.print("Turnrate: ");
  Serial.println(turnrate);
  //0 <- 71 <-> 111 -> 180
  //medurs        moturs
  digitalWrite(Dir_b1, HIGH);
  analogWrite(Pwm_b, 600);
};
