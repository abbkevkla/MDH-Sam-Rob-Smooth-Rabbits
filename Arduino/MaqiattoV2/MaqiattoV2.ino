#include "EspMQTTClient.h"

EspMQTTClient client(
  "ABB_Indgym_Guest",
  "Welcome2abb",
  "maqiatto.com",  // MQTT Broker server ip
  "kevin.klarin@abbindustrigymnasium.se",   // Can be omitted if not needed
  "1337",   // Can be omitted if not needed
  "TestClient"      // Client name that uniquely identify your device
);

void setup() {
  Serial.begin(115200);
  }

void onConnectionEstablished() {
  Serial.println("connected");
  client.subscribe("kevin.klarin@abbindustrigymnasium.se/lmaoxd", [] (const String &payload)  {
    Serial.println(payload);
  });

  client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd", "This is a message");
}

void loop() {
  client.loop();
  client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd", "left 3");
  delay(3000);
}
