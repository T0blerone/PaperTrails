# Thermal Printer Hardware

## Hardware

- Controller: D1 mini / ESP8266-style board
- Printer: TTL serial thermal printer EM5822H
- Firmware environment: Arduino
- Serial library: SoftwareSerial

## Firmware behavior

The controller should:
- Connect to Wi-Fi
- Poll the server approximately once per minute
- Include a device token when polling
- Receive at most one pending message at a time
- Print the message
- Notify the server after printing
- Be in deep sleep while not active to save power

## Constraints

- Keep payloads small.
- Avoid complex JSON if a simpler format works.
- Avoid heavy dependencies.
- Handle Wi-Fi failure gracefully.
- Handle change of Wi-Fi well, likely through WiFiManager library
- Do not hardcode secrets in committed firmware files.

## Printing considerations

Messages should be plain text by default. Formatting can be added later, such as:
- sender name
- timestamp
- separators
- cute header/footer