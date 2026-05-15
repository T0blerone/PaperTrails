# Feature: Send Note

## Goal

Allow one authenticated user to send a short note to the other user’s thermal printer.

## Requirements

- User must be logged in.
- Message body is required.
- Message should have a reasonable max length suitable for thermal printing.
- Message is stored server-side.
- Message is associated with:
  - sender
  - recipient
  - recipient printer/device
  - status
  - created timestamp
  - printed timestamp, if printed

## Nice-to-have UI details

- Large friendly text area
- Character count
- Send button
- Recent sent notes
- Printed/pending status indicator
- Friendly empty states

## Non-goals

- Group messaging
- Public sharing
- Rich media
- Real-time chat

## Possible Later Additions

- Photo printing