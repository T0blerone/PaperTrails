import { NextResponse } from "next/server";
import { getSessionUser, signIn, signOut } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ user: await getSessionUser() });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const user = await signIn(body.name, body.password);

  if (!user) {
    return NextResponse.json({ error: "Invalid name or password." }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function DELETE() {
  await signOut();
  return new NextResponse(null, { status: 204 });
}
