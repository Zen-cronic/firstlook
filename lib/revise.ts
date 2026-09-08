import { getDb, CampaignItem } from "./db";
import { getTrailerBenchmark, aggregateByItemViaMcp, TrailerBenchmark, ItemMetrics } from "./clickhouse-mcp";
import { generateJSON } from "./llm";

export interface RevisionRecommendation {
  itemId: string;
  platform: string;
  originalCaption: string;
  suggestedCaption: string;
  rationale: string;
  benchmarkComparison: string;
}

export async function proposeCampaignRevision(briefId: string): Promise<RevisionRecommendation | null> {
  const db = getDb();
  
  // Fetch real trailer benchmark stats via mcp-clickhouse
  const benchmark: TrailerBenchmark = await getTrailerBenchmark();

  // Fetch campaign metrics via mcp-clickhouse
  const metrics: ItemMetrics[] = await aggregateByItemViaMcp(briefId);
  if (metrics.length === 0) {
    return null;
  }

  // Find lowest performing item by engagement rate
  let worstItem: ItemMetrics | null = null;
  let lowestEngagementRate = Infinity;

  for (const m of metrics) {
    const rate = m.impressions > 0 ? (m.likes / m.impressions) * 100 : 0;
    if (rate < lowestEngagementRate) {
      lowestEngagementRate = rate;
      worstItem = m;
    }
  }

  if (!worstItem) return null;

  const dbItem = db.prepare("SELECT * FROM campaign_items WHERE id = ?").get(worstItem.item_id) as CampaignItem | undefined;
  if (!dbItem) return null;

  const prompt = `
You are a top theatrical marketing strategist analyzing campaign performance against a real 4.56-billion-row YouTube dataset benchmark.

Benchmark Context (Scanned 4.55B rows in ClickHouse):
- Official Movie Trailer Count: ${benchmark.videos}
- Median Like-to-View Engagement Rate: ${benchmark.medianEngagedPct}%
- Top 90th Percentile (p90) Engagement Rate: ${benchmark.p90EngagedPct}%

Underperforming Campaign Post:
- Platform: ${dbItem.platform}
- Asset Type: ${dbItem.asset_kind}
- Current Caption: "${dbItem.caption}"
- Achieved Engagement Rate: ${lowestEngagementRate.toFixed(2)}% (${worstItem.likes} likes / ${worstItem.impressions} impressions)

Task:
Reason against the real 4.56B ClickHouse benchmark. Explain why this post fell below the p90 benchmark (${benchmark.p90EngagedPct}%) and write a punchier, spoiler-safe revised caption designed to beat the p90 benchmark.

Return a JSON object:
{
  "suggestedCaption": string,
  "rationale": string,
  "benchmarkComparison": string
}
`;

  const res = await generateJSON<{
    suggestedCaption: string;
    rationale: string;
    benchmarkComparison: string;
  }>(prompt);

  return {
    itemId: dbItem.id,
    platform: dbItem.platform,
    originalCaption: dbItem.caption,
    suggestedCaption: res.suggestedCaption,
    rationale: res.rationale,
    benchmarkComparison: res.benchmarkComparison,
  };
}
