# Paper Trails

A personal monorepo for sending short messages from a web app to paired thermal printers.

The app lets two authenticated users submit notes through a modern web UI. Each note is queued for the recipient’s printer. A D1 mini controller polls the server periodically, retrieves pending notes, prints them on a TTL thermal printer, and marks them as printed.

## Main parts

- Web frontend: message composer, inbox/history, auth-protected UI
- Backend/API: authentication, message queue, printer polling endpoints
- Firmware: D1 mini code using Arduino + SoftwareSerial to drive the TTL thermal printer