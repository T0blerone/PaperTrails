# AGENTS.md

## Project rules

- This is a personal monorepo for a web-connected thermal printer note system.
- Keep changes focused and avoid large rewrites unless requested.
- Preserve the monorepo structure.
- Do not add new dependencies without explaining why.
- Never commit secrets, auth tokens, Wi-Fi credentials, device keys, or private URLs.
- Prefer clear, boring code over clever abstractions.

## Security expectations

- The website must require secure login.
- API routes for creating notes must require authenticated users.
- Printer polling endpoints must use a device-specific secret or token.
- Do not expose messages publicly.
- Treat note contents as private.

## Hardware constraints

- Target controller is a D1 mini / ESP8266-style board.
- Printer is a TTL thermal printer model EM5822H.
- Firmware uses Arduino libraries and SoftwareSerial.
- Assume constrained memory and unreliable Wi-Fi.
- Keep printer payloads short and simple.

## Expected workflow

Before finishing a task:
- Run relevant type checks, linting, or tests if available.
- For firmware changes, ensure Arduino code still compiles conceptually and avoids unsupported libraries.
- Summarize changed files and any commands run.