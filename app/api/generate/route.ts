import { NextRequest, NextResponse } from "next/server";
import { generateCampaignVersion } from "@/lib/generate";

export async function POST(req: NextRequest) {
  try {
    const { briefId } = await req.json();
    if (!briefId) {
      return NextResponse.json({ error: "briefId is required." }, { status: 400 });
    }

    const versionId = await generateCampaignVersion(briefId);
    return NextResponse.json({ versionId, success: true });
  } catch (err: any) {
    console.error("Generate API error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate campaign" }, { status: 500 });
  }
}
