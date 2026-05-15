import { NextResponse } from "next/server";
import { authenticateDevice, markPrintedForDevice } from "@/lib/store";

export async function POST(request, { params }) {
  const device = authenticateDevice(
    request.headers.get("x-device-id"),
    request.headers.get("x-device-token")
  );

  if (!device) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const note = markPrintedForDevice(device.id, id);
  if (!note) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
