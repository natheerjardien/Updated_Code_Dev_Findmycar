// This default .ino file will contain logic for the Parking sensors, controlling the two ultrasonic sensors, together with their RGB LEDs, and the brains of the operation (Firebeetle 2 ESP32 C6)

// This is our pin setup. We are using the DFRobot Firebeetle 2 ESP32-C6 board on port 7 to flash the esp
#include <Arduino.h>
#include <WiFi.h> // ESP32 wifi driver library (Espressif Systems, 2023b)
#include "esp_wpa2.h" // WPA2 Enterprise Library
#include <Firebase_ESP_Client.h> // Firebase RTDB Client (Mobizt, 2023)

// BLE Headers that will be needed for our FindMyCar feature (Espressif Systems, 2023a)
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

// Helper headers for Firebase token generation and RTDB operations (Mobizt, 2023)
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Wifi credentials (now uses campus wifi)
#define WIFI_SSID "Edu-WiFi"
#define EAP_IDENTITY "st10435542@myemeris.edu.za"
#define EAP_PASSWORD "Happydays@22"

// Firebase Project Credentials
#define API_KEY "AIzaSyDbL55frdOhcMZPmW3HiUFhBb7AWbj6Nwg"
#define DATABASE_URL "https://wil-smartparking-default-rtdb.firebaseio.com"

// API
#include <HTTPClient.h>
#define API_BASE "http://10.115.234.12:8080"

// BLE unique id for the mobile app link
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"

// Firebase core objects (Mobizt, 2023)
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Default memeory states to track changes and prevent spamming network calls
bool lastStateBay1 = false;
int lastDistBay1 = -1;

bool lastStateBay2 = false;
int lastDistBay2 = -1;

// this is for the first parking sensor + LED
const int TRIG_PIN = 5;  // using pin 5 because pin 4 was found faulty on esp (didnt send trigger correctly unless I held it securely with my finger - cracked solder)
const int ECHO_PIN = 7;
const int RED_PIN = 2;
const int GREEN_PIN = 3;

// this is for the second sensor + LED
const int TRIG_PIN_2 = 6;
const int ECHO_PIN_2 = 8;
const int RED_PIN_2 = 9;
const int GREEN_PIN_2 = 18;

void setup() {
  Serial.begin(115200); // Initializes serial communication at 115200 bits per second

  // Configures the specified pins to act either as an input or an output for Bay 1 (Arduino, 2023c)
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);

  // Configures Bay 2s sensor and LED pins as input or output (Arduino, 2023c)
  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);
  pinMode(RED_PIN_2, OUTPUT);
  pinMode(GREEN_PIN_2, OUTPUT);

  // Turns Bay 1s LEDs OFF initially (anode logic >> HIGH = OFF) (Arduino, 2023b)
  digitalWrite(RED_PIN, HIGH);
  digitalWrite(GREEN_PIN, HIGH);

  // Turns Bay 2s LEDs OFF initially (anode logic >> HIGH = OFF) (Arduino, 2023b)
  digitalWrite(RED_PIN_2, HIGH);
  digitalWrite(GREEN_PIN_2, HIGH);

  // Wifi section
  // Connects ESP32 Station mode to the local Wi-Fi router (Espressif Systems, 2023b)
  WiFi.mode(WIFI_STA);

  // Feeds the credentials to the ESP32 authentication client
  esp_eap_client_set_identity((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
  esp_eap_client_set_username((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
  esp_eap_client_set_password((uint8_t *)EAP_PASSWORD, strlen(EAP_PASSWORD));
  esp_wifi_sta_enterprise_enable();

  WiFi.begin(WIFI_SSID);
  Serial.print("Connecting to Campus Wifi");

  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(300);
    Serial.print(".");
  }

  Serial.println("\nCampus Wifi Connected successfully.");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Bluetooth beacon section
  // BLE Setup (Espressif Systems, 2023a)
  Serial.println("Initializing BLE Server...");
  BLEDevice::init("Parkitects Beacon 1");
  Serial.println("BLE Broadcasting Started: Parkitects Beacon 1");
  BLEServer *pServer = BLEDevice::createServer();

  // BLE broadcasting section (Espressif Systems, 2023a)
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  
  BLEDevice::startAdvertising();
  Serial.println("BLE Advertising Started: Parkitects Beacon");

  // Firebase section
  // Configures Firebase API Key and Realtime Database URL (Mobizt, 2023)
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Registers anonymous credentials to use token for communication (Mobizt, 2023)
  if (Firebase.signUp(&config, &auth, "", "")) 
  {
    Serial.println("Firebase Auth Successful.");
  } 
  else 
  {
    Serial.printf("Firebase Auth Error: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  
  // Sets memory buffer limits to ensure quick operations
  fbdo.setResponseSize(1024);
  fbdo.setBSSLBufferSize(1024, 512);

  // Starts the Firebase client services (Mobizt, 2023)
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  delay(1000); 
  Serial.println("Starting Distance Test with Bay 1 & 2's sensors...");

}

void postTelemetry(int sensorId, int distanceCm, bool occupied) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(String(API_BASE) + "/api/Parking/sensor/telemetry");
  http.addHeader("Content-Type", "application/json");
  String body = "{\"sensorID\":" + String(sensorId) +
                ",\"distanceReadingCm\":" + String(distanceCm) +
                ",\"isOccupied\":" + (occupied ? "true" : "false") + "}";
  int code = http.POST(body);
  Serial.printf("[API] sensor %d -> HTTP %d\n", sensorId, code);
  http.end();
}

// Created this function to trigger, read and display the occupancy status for either of the 2 bays
void processBay(int trigPin, int echoPin, int redPin, int greenPin, String bayId, bool &lastState, int &lastDist) {
  // Clears and sends a pulse (Arduino, 2023b)
  // This fires the trigger
  digitalWrite(trigPin, LOW); // Clears the trigger pin by setting the voltage to LOW (Arduino, 2023b)
  delayMicroseconds(2); // Pauses the program for the amount of time (in microseconds) specified (Arduino, 2023a)
  // Fires the pulse by setting the pin to HIGH for 20 microseconds (Arduino, 2023b)
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(20);
  digitalWrite(trigPin, LOW);

  // Reads the pulse on a pin and returns the length of the pulse in microseconds (Arduino, 2023d)
  // The 30000 parameter is the timeout to prevent the board from freezing if no echo returns
  long duration = pulseIn(echoPin, HIGH, 30000);
  int currentDistance = 0;
  bool isCurrentlyOccupied = false;

  // Logic for the RGB LEDs to turn green when parking spot is available (specified distance) or red when occupied (passed the specified distance)
  // 0 represents a timeout from the sensors 20cm blind spot, meaning the bay is occupied
  if (duration == 0) 
  {
    Serial.println(bayId + " Status: Occupied");
    isCurrentlyOccupied = true;
    currentDistance = 0;
    // Turns the red light ON (LOW) and green OFF (HIGH) (Arduino, 2023b)
    digitalWrite(redPin, LOW);
    digitalWrite(greenPin, HIGH);
  } 
  else 
  {
    // Calculates speed of sound (Random Nerd Tutorials, 2019)
    currentDistance = duration * 0.034 / 2;
    isCurrentlyOccupied = (currentDistance <= 60);
  }

  // LED section
  // Changes the LED colours based off the occupancy state
  if (isCurrentlyOccupied)
  {
    // Turns red ON (LOW) and GREEN OFF (HIGH) (Arduino, 2023b)
    digitalWrite(redPin, LOW);
    digitalWrite(greenPin, HIGH);
  } 
  else
  {
    // Turns the green light ON (LOW) and RED OFF (HIGH) (Arduino, 2023b)
    digitalWrite(greenPin, LOW);
    digitalWrite(redPin, HIGH);
  }

  // Determines if the parking status changed or if distance just shifted by at least 4cm
  bool stateChanged = (isCurrentlyOccupied != lastState);
  bool distanceShifted = (abs(currentDistance - lastDist) >= 4);
  bool firstRun = (lastDist == -1);

  if ((stateChanged || distanceShifted) && Firebase.ready()) 
  {
    lastState = isCurrentlyOccupied;
    lastDist = currentDistance;

    String basePath = "/ParkingLots/Lot_A/nodes/Node_01/bays/" + bayId;
    FirebaseJson json; // Creates structured JSON object for batch transmission (Mobizt, 2023)

    json.set("status", isCurrentlyOccupied ? "Occupied" : "Available");
    json.set("distanceCm", currentDistance);
    json.set("isLive", true);

    // Leaves user identifier ready for mobile app handshake
    if (stateChanged || firstRun) 
    {
      json.set("occupiedByUserId", isCurrentlyOccupied ? "Anonymous" : "None");
    }

    // Pushes all fields in one single network packet to avoid ESP32 freezing (Mobizt, 2023)
    if (Firebase.RTDB.updateNode(&fbdo, basePath, &json)) 
    {
      Serial.printf("[%s] Live Sync: %s (%d cm)\n", bayId.c_str(), isCurrentlyOccupied ? "Occupied" : "Available", currentDistance);
    } 
    else 
    {
      Serial.printf("[%s] Sync Error: %s\n", bayId.c_str(), fbdo.errorReason().c_str());
    }
  }

}

void loop() {
  // Runs the scan for Bay 1
  processBay(TRIG_PIN, ECHO_PIN, RED_PIN, GREEN_PIN, "Bay1", lastStateBay1, lastDistBay1);
  
  // 50ms time allows the physical ultrasonic reflections to clear before triggering the next sensor
  delay(50);
  
  // Runs rhe scan for Bay 2
  processBay(TRIG_PIN_2, ECHO_PIN_2, RED_PIN_2, GREEN_PIN_2, "Bay2", lastStateBay2, lastDistBay2);
  
  Serial.println("-------------------------");
  
  delay(250);

}

/* REFERENCES:

 * Arduino, 2023a. delayMicroseconds() (Version 2.0) [Source Code] Available at: < https://www.arduino.cc/reference/en/language/functions/time/delaymicroseconds/ > [Accessed 16 August 2026]
 * Arduino, 2023b. digitalWrite() (Version 2.0) [Source Code] Available at: < https://www.arduino.cc/reference/en/language/functions/digital-io/digitalwrite/ > [Accessed 16 August 2026]
 * Arduino, 2023c. pinMode() (Version 2.0) [Source Code] Available at: < https://www.arduino.cc/reference/en/language/functions/digital-io/pinmode/ > [Accessed 16 August 2026]
 * Arduino, 2023d. pulseIn() (Version 2.0) [Source Code] Available at: < https://www.arduino.cc/reference/en/language/functions/advanced-io/pulsein/ > [Accessed 16 August 2026]
 * Espressif Systems, 2023a. BLE_Beacon Example (Version 3.0) [Source Code] Available at: < https://github.com/espressif/arduino-esp32/tree/master/libraries/BLE > [Accessed 24 August 2026]
 * Espressif Systems, 2023b. WiFi Station Example (Version 3.0) [Source Code] Available at: < https://github.com/espressif/arduino-esp32/tree/master/libraries/WiFi > [Accessed 22 August 2026]
 * Mobizt, 2023. Firebase Arduino Client Library for ESP8266 and ESP32 (Version 4.4.14) [Source Code] Available at: < https://github.com/mobizt/Firebase-ESP-Client > [Accessed 22 August 2026]
 * Random Nerd Tutorials, 2019. Complete Guide for Ultrasonic Sensor HC-SR04 with Arduino. [online] Available at: < https://randomnerdtutorials.com/complete-guide-for-ultrasonic-sensor-hc-sr04/ > [Accessed 18 August 2026]

*/
