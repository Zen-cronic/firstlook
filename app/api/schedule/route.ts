import { NextRequest, NextResponse } from "next/server";
import { approveVersionAndScheduleItems } from "@/lib/schedule";

export async function POST(req: NextRequest) {
  try {
    const { briefId, versionId } = await req.json();
    if (!briefId || !versionId) {
      return NextResponse.json({ error: "briefId and versionId are required." }, { status: 400 });
    }

    approveVersionAndScheduleItems(briefId, versionId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to schedule items" }, { status: 500 });
  }
}
