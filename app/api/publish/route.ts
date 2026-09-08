import { NextRequest, NextResponse } from "next/server";
import { publishSimulatedItem } from "@/lib/schedule";

export async function POST(req: NextRequest) {
  try {
    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: "itemId is required." }, { status: 400 });
    }

    const rowsWritten = await publishSimulatedItem(itemId);
    return NextResponse.json({ success: true, rowsWritten, simulationState: "Published · SIM" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to publish item" }, { status: 500 });
  }
}
