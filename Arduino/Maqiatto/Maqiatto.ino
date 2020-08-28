#include "EspMQTTClient.h"
//Install libraries PubSubClient and EspMQTTClient

void onConnectionEstablished();

EspMQTTClient client(
 "ABB_Indgym_Guest",           // Wifi ssid
  "Welcome2abb",           // Wifi password
  "maqiatto.com",  // MQTT broker ip
  1883,             // MQTT broker port
  "kevin.klarin@abbindustrigymnasium.se",            // MQTT username
  "1337",       // MQTT password
  "mememaster69",          // Client name
  onConnectionEstablished, // Connection established callback
  true,             // Enable web updater
  true              // Enable debug messages
);


void setup() {
  Serial.begin(115200);
}

void onConnectionEstablished()
{
  client.subscribe("kevin.klarin@abbindustrigymnasium.se/lmaoxd", [] (const String &payload)
  {
    Serial.println(payload);
  });
  client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd", "This is the first message");
}


void loop() {
  client.publish("kevin.klarin@abbindustrigymnasium.se/lmaoxd","Reeeeeeeeeeeeeeeeeeee");
  delay(3000);
}
