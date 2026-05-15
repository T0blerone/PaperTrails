# Architecture

## System overview

The system has three main parts:

1. Web app
   - Authenticated UI for composing and viewing notes

2. Server/API
   - Stores users, devices, and messages
   - Queues messages for recipient printers
   - Provides polling endpoint for printer controllers

3. Printer firmware
   - Runs on D1 mini
   - Connects to Wi-Fi
   - Polls server every ~60 seconds
   - Prints pending notes
   - Marks notes as printed after successful print
   - Device is in deep sleep while not polling/printing

## Basic flow

1. User logs into the website.
2. User submits a message.
3. Server stores the message as pending for the recipient.
4. Recipient’s D1 mini polls the server.
5. Server returns the next pending message, if any.
6. Device prints the message on the thermal printer.
7. Device calls back to mark the message as printed.

## Polling model

The controller should poll instead of maintaining a persistent WebSocket connection. This keeps firmware simpler and more reliable on constrained hardware.

## Message states

Possible message states:
- `pending`
- `claimed`
- `printed`
- `failed`

A message should not be marked printed until the device confirms successful print.