#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266WebServer.h>

#include <Base64.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 2  // DS18B20 pin
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
ESP8266WiFiMulti wifiMulti;

bool led = false;

ESP8266WebServer HTTP(80);

void setup() {
  pinMode(BUILTIN_LED, OUTPUT); 

  wifiMulti.addAP("yourssid", "yourpassword");
  wifiMulti.addAP("yourotherssid", "yourotherpassword");

  
  Serial.begin(115200);
  delay(10);
  
  // Connect to WiFi network
  
  
  while (wifiMulti.run() != WL_CONNECTED) {
    delay(500);
    Serial.println(WiFi.localIP());
    if(led) {
        digitalWrite(BUILTIN_LED, LOW); 
        led = false;
    }
    else
    {
      digitalWrite(BUILTIN_LED, HIGH);
      led = true;      
    }
    
  }
  Serial.println("");
  Serial.println("WiFi connected");
  
  // Start the server
  HTTP.onNotFound(handleAllOthers);
  HTTP.begin();
  Serial.println("Server started");

  // Print the IP address
  Serial.println(WiFi.localIP());

  
}

void loop() {

  if(WiFi.status() == WL_CONNECTED) {
        digitalWrite(BUILTIN_LED, HIGH); 
        led = true;
    }
    else
    {
      digitalWrite(BUILTIN_LED, LOW);
      led = false;      
    }

  HTTP.handleClient();

  
  
}


void handleAllOthers() {
  String requestedUri = HTTP.uri();
  
  if ( requestedUri.endsWith("/temp") )
  { 
       HTTP.send(200, "text/plain", "{ \"temp\" : " + (String) getTemp() + " }");
  }
  else
  {
    // Print what the client has POSTed
    for (uint8_t i = 0; i < HTTP.args(); i++) Serial.printf("ARG[%u]: %s=%s\n", i, HTTP.argName(i).c_str(), HTTP.arg(i).c_str());

    HTTP.send(200, "text/html", "<html><head> <script src=\"https//adjustThis.url/external.js\" type=\"text/javascript\"></script></head><body></body></html>");
  }


}

float getTemp() {
      float temp;
      DS18B20.requestTemperatures(); 
      temp = DS18B20.getTempCByIndex(0);
      Serial.print("Temperature: ");
      Serial.println(temp);
      return temp;
}


