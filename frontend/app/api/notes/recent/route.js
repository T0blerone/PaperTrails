import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { getDeviceStatus, listPeopleForUser, listRecentNotes } from "@/lib/store";
import { NOTE_MAX_LENGTH } from "@/lib/config";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Login is required." }, { status: 401 });
  }

  return NextResponse.json({
    user,
    people: listPeopleForUser(user.id),
    notes: listRecentNotes(user.id),
    devices: getDeviceStatus(),
    maxLength: NOTE_MAX_LENGTH
  });
}
