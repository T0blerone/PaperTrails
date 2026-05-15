#pragma once

// Copy this file to include/config.h and fill in local values.
// Do not commit include/config.h.

#define WIFI_SSID "your-wifi-name"
#define WIFI_PASSWORD "your-wifi-password"

// Example: "https://papertrails.example.com" or "http://192.168.1.50:3000"
#define SERVER_BASE_URL "https://papertrails.example.com"

// Create these per physical printer in the webserver database.
#define DEVICE_ID "printer-a"
#define DEVICE_TOKEN "replace-with-a-long-random-device-token"

// true uses hardware Serial1 TX on D4/GPIO2. Wire D4 to printer RX.
// false uses SoftwareSerial with PRINTER_RX_PIN/PRINTER_TX_PIN below.
#define PRINTER_USE_SERIAL1 false

// D1 mini labels: D7 is GPIO13, D6 is GPIO12.
// Used only when PRINTER_USE_SERIAL1 is false.
#define PRINTER_RX_PIN 13
#define PRINTER_TX_PIN 12
#define PRINTER_BAUD_RATE 115200
#define PRINTER_LINE_DELAY_MS 25

// ESP8266 deep sleep only wakes automatically when D0/GPIO16 is wired to RST.
// Set false while bench testing without that jumper.
#define USE_DEEP_SLEEP false
