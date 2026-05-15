import { cookies } from "next/headers";
import crypto from "node:crypto";
import { getUsers, publicUser } from "./config";

const SESSION_COOKIE = "paper_trails_session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) {
    return null;
  }

  const userId = session.userId;
  const user = getUsers().find((candidate) => candidate.id === userId);
  return user ? publicUser(user) : null;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  return user;
}

export async function signIn(name, password) {
  const user = getUsers().find(
    (candidate) =>
      candidate.name.toLowerCase() === String(name).trim().toLowerCase() &&
      candidate.password === password
  );

  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return publicUser(user);
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

function createSession(userId) {
  return `${userId}.${sign(userId)}`;
}

function parseSession(value) {
  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");
  if (!userId || !signature) {
    return null;
  }

  const expected = sign(userId);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  return { userId };
}

function sign(value) {
  return crypto
    .createHmac("sha256", process.env.APP_SECRET || "local-development-secret")
    .update(value)
    .digest("base64url");
}
