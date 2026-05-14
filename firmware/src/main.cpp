#include <Arduino.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>

void finishPrinting();
void setInverse(bool enable);
void printUpsideDown(String text);

SoftwareSerial printer(13, 12); // RX=D7(GPIO13), TX=D6(GPIO12)

const int maxCharsPerLine = 32;

bool printed = false;

void setup() {
  Serial.begin(115200);
  printer.begin(115200);

  delay(500);

  // Initialize - $1B $40 (reset to defaults clear buffer)
  printer.write(0x1B);
  printer.write(0x40);  
}

void loop() {
  
}

void finishPrinting() {
  // Print and Feed Paper n Lines - $1B $64 n
  printer.write(0x1B);
  printer.write(0x64);
  printer.write(4);
}

void setInverse(bool enable) {
  printer.write(0x1B); printer.write(0x7B);
  printer.write(enable ? 1 : 0); // GS B n
}

/*
Set array of lines to print
Need to print last line first, so fill the array from start to finish, and then print it from end to beginning.
Read 32 chars in and if it isn't a whitespace, go back until you find one. 
If you go back 20 chars and don't find one, add hyphen.
If server side receives a message that would be over 100 lines, send it to printer as multiple messages.
*/
void printUpsideDown(String text) {
  String lines[100];
  int lineCount = 0;
  int len = text.length();
  int lastUsed = 0;

  while (lastUsed < len) {
    int remaining = len - lastUsed;

    if (remaining <= maxCharsPerLine) {
      lines[lineCount++] = text.substring(lastUsed);
      break;
    }

    int pointer = lastUsed + maxCharsPerLine;

    while (pointer > lastUsed && text[pointer] != ' ') {
      pointer--;
    }

    if (pointer == lastUsed) {
      lines[lineCount++] = text.substring(lastUsed, lastUsed + maxCharsPerLine - 1) + '-';
      lastUsed += maxCharsPerLine - 1;
    } else {
      lines[lineCount++] = text.substring(lastUsed, pointer);
      lastUsed = pointer + 1;
    }

    if (lineCount >= 99) break;
  }

  //Print
  setInverse(true);
  for (int i = lineCount - 1; i >= 0; i--) {
    printer.println(lines[i]);
  }
  setInverse(false);
  finishPrinting();
}