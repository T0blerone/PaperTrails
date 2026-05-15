# Webserver and Frontend Starting Design

## Product shape

Paper Trails should stay small: two authenticated users, two printers, short private notes, and a recent history view. The web app should feel warm and personal, but the server should be strict about auth and device ownership.

## Recommended first stack

- Next.js app with server routes and React UI
- Auth.js or another mature session-based auth provider
- SQLite for local development, with a path to Postgres later
- Prisma or plain SQL migrations, depending on how much schema tooling is wanted

These are recommendations, not committed dependencies yet. The firmware can be developed against the HTTP contract in `docs/architecture.md` before the web stack is chosen.

## Data model

`users`
- `id`
- `name`
- `email`
- `passwordHash` or provider account link
- `createdAt`

`devices`
- `id`
- `ownerUserId`
- `label`
- `tokenHash`
- `lastSeenAt`
- `createdAt`

`notes`
- `id`
- `senderUserId`
- `recipientUserId`
- `recipientDeviceId`
- `body`
- `status`: `pending`, `claimed`, `printed`, or `failed`
- `claimedAt`
- `printedAt`
- `createdAt`

## Auth rules

- All browser pages except login require a valid user session.
- `POST /api/notes` requires a user session.
- Note history endpoints return only notes sent or received by the signed-in user.
- Device polling endpoints do not use browser sessions; they require `X-Device-Id` plus `X-Device-Token`.
- Store only a hash of each device token server-side.

## Browser API routes

`POST /api/notes`
- Body: `{ "recipientUserId": "...", "body": "..." }`
- Validate session, recipient, and body length.
- Create a `pending` note for the recipient's active device.

`GET /api/notes/recent`
- Returns recent sent and received notes visible to the current user.
- Include status, timestamps, sender, recipient, and body.

## Device API routes

`GET /api/device/notes/next`
- Validate device headers.
- Find the oldest `pending` note for that device.
- Atomically change it to `claimed`.
- Return `204` if none exists.
- Return one `text/plain` payload for the firmware:

```text
id:msg_123
from:Toby
created:2026-05-14T22:30:00Z
body:
short message body
```

`POST /api/device/notes/:id/printed`
- Validate device headers.
- Confirm the note belongs to that device and is `claimed`.
- Mark it `printed` and set `printedAt`.

## First UI screens

Login:
- Minimal secure login form.
- No public note content.

Composer:
- Large note textarea.
- Character count with a hard limit matching firmware expectations.
- Recipient shown as the other person by default.
- Send button disabled until valid.

Recent notes:
- Sent and received notes in one cozy timeline.
- Status labels for pending, claimed, printed, and failed.
- Friendly empty state.

Device status:
- Small status area showing each printer label and last seen time.
- No device tokens displayed after creation.
