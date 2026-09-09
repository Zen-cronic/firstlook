import { NextRequest, NextResponse } from "next/server";
import { aggregateByItemViaMcp, getFunnelMetricsViaMcp } from "@/lib/clickhouse-mcp";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const briefId = searchParams.get("briefId");
    const itemIdParam = searchParams.get("itemId");

    if (!briefId) {
      return NextResponse.json({ error: "briefId is required." }, { status: 400 });
    }

    // Read pre-aggregated metrics from ClickHouse AggregatingMergeTree rollup
    const rollups = await aggregateByItemViaMcp(briefId);

    // Determine target item for the sequential windowFunnel
    const targetItemId = itemIdParam || (rollups.length > 0 ? rollups[0].item_id : "");

    let funnel = { reached: 0, watched: 0, engaged: 0, clicked: 0 };
    if (targetItemId) {
      funnel = await getFunnelMetricsViaMcp(briefId, targetItemId);
    }

    return NextResponse.json({
      success: true,
      briefId,
      activeItemId: targetItemId,
      rollups,
      funnel,
      engine: "ClickHouse AggregatingMergeTree (campaign_rollup) + windowFunnel(3600)",
      zeroRawScans: true,
    });
  } catch (err: any) {
    console.error("Analytics API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch analytics from ClickHouse" },
      { status: 500 }
    );
  }
}
