#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <WiFiClient.h>
#include <WiFiClientSecureBearSSL.h>

#include "config.h"

SoftwareSerial printer(PRINTER_RX_PIN, PRINTER_TX_PIN);

const uint16_t MAX_CHARS_PER_LINE = 32;
const uint16_t MAX_NOTE_CHARS = 800;
const uint32_t WIFI_CONNECT_TIMEOUT_MS = 20000;
const uint64_t SLEEP_AFTER_POLL_US = 60ULL * 1000ULL * 1000ULL;

struct PendingNote {
  bool available = false;
  String id;
  String sender;
  String createdAt;
  String body;
};

void initializePrinter();
bool connectWiFi();
PendingNote pollNextNote();
bool acknowledgePrinted(const String &noteId);
bool httpGet(const String &url, String &payload, int &statusCode);
bool httpPost(const String &url, const String &body, int &statusCode);
void addDeviceHeaders(HTTPClient &http);
bool parseNotePayload(String payload, PendingNote &note);
String apiUrl(const String &path);
String encodePathSegment(const String &value);
void printNote(const PendingNote &note);
void printWrapped(const String &text);
void printSeparator();
void finishPrinting();
void deepSleep();

void setup() {
  Serial.begin(115200);
  delay(100);

  initializePrinter();

  if (!connectWiFi()) {
    Serial.println("Wi-Fi unavailable; sleeping until next poll.");
    deepSleep();
  }

  PendingNote note = pollNextNote();
  if (note.available) {
    printNote(note);

    if (!acknowledgePrinted(note.id)) {
      Serial.println("Printed note, but printed acknowledgement failed.");
    }
  } else {
    Serial.println("No pending note.");
  }

  deepSleep();
}

void loop() {
}

void initializePrinter() {
  printer.begin(PRINTER_BAUD_RATE);
  delay(500);

  printer.write(0x1B);
  printer.write(0x40);
}

bool connectWiFi() {
  Serial.print("Connecting to Wi-Fi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t startedAt = millis();
  while (WiFi.status() != WL_CONNECTED &&
         millis() - startedAt < WIFI_CONNECT_TIMEOUT_MS) {
    delay(250);
    Serial.print(".");
    yield();
  }

  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  Serial.print("Connected: ");
  Serial.println(WiFi.localIP());
  return true;
}

PendingNote pollNextNote() {
  PendingNote note;
  String payload;
  int statusCode = 0;

  if (!httpGet(apiUrl("/api/device/notes/next"), payload, statusCode)) {
    Serial.printf("Poll failed with status %d\n", statusCode);
    return note;
  }

  if (statusCode == 204 || payload.length() == 0) {
    return note;
  }

  if (statusCode != 200) {
    Serial.printf("Unexpected poll status %d\n", statusCode);
    return note;
  }

  if (!parseNotePayload(payload, note)) {
    Serial.println("Could not parse note payload.");
  }

  return note;
}

bool acknowledgePrinted(const String &noteId) {
  int statusCode = 0;
  String url = apiUrl("/api/device/notes/" + encodePathSegment(noteId) + "/printed");
  bool requestOk = httpPost(url, "", statusCode);
  return requestOk && (statusCode == 200 || statusCode == 204);
}

bool httpGet(const String &url, String &payload, int &statusCode) {
  if (url.startsWith("https://")) {
    BearSSL::WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    if (!http.begin(client, url)) {
      statusCode = -1;
      return false;
    }

    addDeviceHeaders(http);
    statusCode = http.GET();
    payload = statusCode > 0 ? http.getString() : "";
    http.end();
    return statusCode > 0;
  }

  WiFiClient client;
  HTTPClient http;
  if (!http.begin(client, url)) {
    statusCode = -1;
    return false;
  }

  addDeviceHeaders(http);
  statusCode = http.GET();
  payload = statusCode > 0 ? http.getString() : "";
  http.end();
  return statusCode > 0;
}

bool httpPost(const String &url, const String &body, int &statusCode) {
  if (url.startsWith("https://")) {
    BearSSL::WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    if (!http.begin(client, url)) {
      statusCode = -1;
      return false;
    }

    addDeviceHeaders(http);
    statusCode = http.POST(body);
    http.end();
    return statusCode > 0;
  }

  WiFiClient client;
  HTTPClient http;
  if (!http.begin(client, url)) {
    statusCode = -1;
    return false;
  }

  addDeviceHeaders(http);
  statusCode = http.POST(body);
  http.end();
  return statusCode > 0;
}

void addDeviceHeaders(HTTPClient &http) {
  http.addHeader("X-Device-Id", DEVICE_ID);
  http.addHeader("X-Device-Token", DEVICE_TOKEN);
  http.addHeader("Content-Type", "text/plain");
}

bool parseNotePayload(String payload, PendingNote &note) {
  if (payload.length() > MAX_NOTE_CHARS + 256) {
    return false;
  }

  payload.replace("\r\n", "\n");
  payload.replace("\r", "\n");

  int bodyMarker = payload.indexOf("\nbody:\n");
  if (bodyMarker < 0) {
    return false;
  }

  String headers = payload.substring(0, bodyMarker);
  note.body = payload.substring(bodyMarker + 7);
  note.body.trim();

  uint16_t cursor = 0;
  while (cursor < headers.length()) {
    int newline = headers.indexOf('\n', cursor);
    if (newline < 0) {
      newline = headers.length();
    }

    String line = headers.substring(cursor, newline);
    if (line.startsWith("id:")) {
      note.id = line.substring(3);
      note.id.trim();
    } else if (line.startsWith("from:")) {
      note.sender = line.substring(5);
      note.sender.trim();
    } else if (line.startsWith("created:")) {
      note.createdAt = line.substring(8);
      note.createdAt.trim();
    }

    cursor = static_cast<uint16_t>(newline + 1);
  }

  if (note.body.length() > MAX_NOTE_CHARS) {
    note.body = note.body.substring(0, MAX_NOTE_CHARS);
  }

  note.available = note.id.length() > 0 && note.body.length() > 0;
  return note.available;
}

String apiUrl(const String &path) {
  String base = SERVER_BASE_URL;
  if (base.endsWith("/")) {
    base.remove(base.length() - 1);
  }

  return base + path;
}

String encodePathSegment(const String &value) {
  String encoded;
  const char *hex = "0123456789ABCDEF";

  for (uint16_t i = 0; i < value.length(); i++) {
    uint8_t c = static_cast<uint8_t>(value[i]);
    bool safe = (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
                (c >= '0' && c <= '9') || c == '-' || c == '_' ||
                c == '.';

    if (safe) {
      encoded += static_cast<char>(c);
    } else {
      encoded += '%';
      encoded += hex[(c >> 4) & 0x0F];
      encoded += hex[c & 0x0F];
    }
  }

  return encoded;
}

void printNote(const PendingNote &note) {
  printer.println();
  printSeparator();

  if (note.sender.length() > 0) {
    printer.print("From: ");
    printer.println(note.sender);
  }

  if (note.createdAt.length() > 0) {
    printer.println(note.createdAt);
  }

  printSeparator();
  printWrapped(note.body);
  printSeparator();
  finishPrinting();
}

void printWrapped(const String &text) {
  uint16_t cursor = 0;

  while (cursor < text.length()) {
    if (text[cursor] == '\n') {
      printer.println();
      cursor++;
      continue;
    }

    uint16_t lineEnd = min<uint16_t>(cursor + MAX_CHARS_PER_LINE, text.length());
    uint16_t newline = text.indexOf('\n', cursor);
    if (newline != 65535 && newline < lineEnd) {
      lineEnd = newline;
    }

    if (lineEnd < text.length() && text[lineEnd] != '\n') {
      uint16_t space = lineEnd;
      while (space > cursor && text[space] != ' ') {
        space--;
      }

      if (space > cursor) {
        lineEnd = space;
      }
    }

    String line = text.substring(cursor, lineEnd);
    line.trim();
    printer.println(line);

    cursor = lineEnd;
    while (cursor < text.length() && text[cursor] == ' ') {
      cursor++;
    }

    yield();
  }
}

void printSeparator() {
  printer.println("------------------------------");
}

void finishPrinting() {
  printer.write(0x1B);
  printer.write(0x64);
  printer.write(4);
}

void deepSleep() {
  Serial.println("Sleeping.");
  Serial.flush();
  ESP.deepSleep(SLEEP_AFTER_POLL_US);
}
