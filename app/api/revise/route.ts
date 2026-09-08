import { NextRequest, NextResponse } from "next/server";
import { proposeCampaignRevision } from "@/lib/revise";

export async function POST(req: NextRequest) {
  try {
    const { briefId } = await req.json();
    if (!briefId) {
      return NextResponse.json({ error: "briefId is required." }, { status: 400 });
    }

    const recommendation = await proposeCampaignRevision(briefId);
    return NextResponse.json({ recommendation, success: true });
  } catch (err: any) {
    console.error("Revise API error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate revision" }, { status: 500 });
  }
}
