import { NextResponse } from "next/server";
import { getTrailerBenchmark } from "@/lib/clickhouse-mcp";

export async function GET() {
  try {
    const benchmark = await getTrailerBenchmark();
    return NextResponse.json({
      ...benchmark,
      mcpServer: "mcp-clickhouse (sql-clickhouse.clickhouse.com:8443)",
      tableScanned: "youtube.youtube",
    });
  } catch (err: any) {
    console.error("Benchmark API error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch benchmark" }, { status: 500 });
  }
}
