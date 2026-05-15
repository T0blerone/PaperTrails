import crypto from "node:crypto";
import { getDevices, getUsers, NOTE_MAX_LENGTH, publicUser } from "./config";

const globalStore = globalThis.__paperTrailsStore || {
  notes: [],
  deviceLastSeen: {}
};

globalThis.__paperTrailsStore = globalStore;

export function listPeopleForUser(userId) {
  return getUsers()
    .filter((user) => user.id !== userId)
    .map(publicUser);
}

export function getRecipientForUser(userId) {
  const recipient = getUsers().find((user) => user.id !== userId);
  return recipient ? publicUser(recipient) : null;
}

export function listRecentNotes(userId) {
  return globalStore.notes
    .filter((note) => note.senderUserId === userId || note.recipientUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30)
    .map(decorateNote);
}

export function createNote({ senderUserId, recipientUserId, body }) {
  const cleanedBody = String(body || "").trim();
  if (!cleanedBody) {
    throw new Error("Message body is required.");
  }

  if (cleanedBody.length > NOTE_MAX_LENGTH) {
    throw new Error(`Message must be ${NOTE_MAX_LENGTH} characters or fewer.`);
  }

  const recipient = getUsers().find((user) => user.id === recipientUserId);
  if (!recipient) {
    throw new Error("Recipient was not found.");
  }

  const device = getDevices().find((candidate) => candidate.ownerUserId === recipient.id);
  if (!device) {
    throw new Error("Recipient does not have a printer configured.");
  }

  const note = {
    id: `msg_${crypto.randomUUID()}`,
    senderUserId,
    recipientUserId,
    recipientDeviceId: device.id,
    body: cleanedBody,
    status: "pending",
    claimedAt: null,
    printedAt: null,
    createdAt: new Date().toISOString()
  };

  globalStore.notes.push(note);
  return decorateNote(note);
}

export function authenticateDevice(deviceId, token) {
  const device = getDevices().find((candidate) => candidate.id === deviceId);
  if (!device || !token) {
    return null;
  }

  const expected = Buffer.from(device.token);
  const actual = Buffer.from(token);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return null;
  }

  globalStore.deviceLastSeen[device.id] = new Date().toISOString();
  return device;
}

export function claimNextNoteForDevice(deviceId) {
  const note = globalStore.notes.find(
    (candidate) =>
      candidate.recipientDeviceId === deviceId && candidate.status === "pending"
  );

  if (!note) {
    return null;
  }

  note.status = "claimed";
  note.claimedAt = new Date().toISOString();
  return decorateNote(note);
}

export function markPrintedForDevice(deviceId, noteId) {
  const note = globalStore.notes.find(
    (candidate) => candidate.id === noteId && candidate.recipientDeviceId === deviceId
  );

  if (!note || note.status !== "claimed") {
    return null;
  }

  note.status = "printed";
  note.printedAt = new Date().toISOString();
  return decorateNote(note);
}

export function getDeviceStatus() {
  return getDevices().map((device) => ({
    id: device.id,
    label: device.label,
    ownerUserId: device.ownerUserId,
    lastSeenAt: globalStore.deviceLastSeen[device.id] || null
  }));
}

export function formatDevicePayload(note) {
  return [
    `id:${note.id}`,
    `from:${note.sender.name}`,
    `created:${note.createdAt}`,
    "body:",
    note.body
  ].join("\n");
}

function decorateNote(note) {
  const users = getUsers();
  const sender = users.find((user) => user.id === note.senderUserId);
  const recipient = users.find((user) => user.id === note.recipientUserId);

  return {
    ...note,
    sender: sender ? publicUser(sender) : null,
    recipient: recipient ? publicUser(recipient) : null
  };
}
