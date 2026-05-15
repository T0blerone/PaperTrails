import { NextResponse } from "next/server";
import {
  authenticateDevice,
  claimNextNoteForDevice,
  formatDevicePayload
} from "@/lib/store";

export async function GET(request) {
  const device = authenticateDevice(
    request.headers.get("x-device-id"),
    request.headers.get("x-device-token")
  );

  if (!device) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const note = claimNextNoteForDevice(device.id);
  if (!note) {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(formatDevicePayload(note), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
