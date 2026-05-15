import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { createNote, getRecipientForUser } from "@/lib/store";

export async function POST(request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Login is required." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const recipient = getRecipientForUser(user.id);

  if (!recipient) {
    return NextResponse.json({ error: "No recipient is configured." }, { status: 400 });
  }

  try {
    const note = createNote({
      senderUserId: user.id,
      recipientUserId: recipient.id,
      body: body.body
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
