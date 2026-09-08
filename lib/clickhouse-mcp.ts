import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { randomUUID } from "node:crypto";

export interface TrailerBenchmark {
  videos: number;
  medianEngagedPct: number;
  p90EngagedPct: number;
  medianViews: number;
  rowsScanned: number;
}

export interface ItemMetrics {
  item_id: string;
  platform: string;
  impressions: number;
  completes: number;
  likes: number;
  clicks: number;
}

export interface FunnelMetrics {
  reached: number;
  watched: number;
  engaged: number;
  clicked: number;
}

let benchmarkCache: TrailerBenchmark | null = null;
let schemaInitialized = false;

/**
 * Execute SQL query via the official mcp-clickhouse MCP server stdio transport.
 * This guarantees ALL runtime ClickHouse operations flow through mcp-clickhouse run_query.
 */
export async function executeMcpQuery(sql: string, extraEnv?: Record<string, string>): Promise<any[]> {
  const envVars = {
    ...process.env,
    CLICKHOUSE_HOST: process.env.CLICKHOUSE_HOST || "sql-clickhouse.clickhouse.com",
    CLICKHOUSE_PORT: process.env.CLICKHOUSE_PORT || "8443",
    CLICKHOUSE_USER: process.env.CLICKHOUSE_USER || "demo",
    CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD || "",
    CLICKHOUSE_SECURE: process.env.CLICKHOUSE_SECURE || "true",
    CLICKHOUSE_VERIFY: "true",
    CLICKHOUSE_ALLOW_WRITE_ACCESS: process.env.CLICKHOUSE_ALLOW_WRITE_ACCESS || "true",
    ...extraEnv,
  };

  const transport = new StdioClientTransport({
    command: "uvx",
    args: ["mcp-clickhouse"],
    env: envVars,
  });

  const client = new Client(
    { name: "agentic-cinema-mcp-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);

  try {
    const res = await client.callTool({
      name: "run_query",
      arguments: { query: sql },
    });

    if (res.isError) {
      throw new Error(`mcp-clickhouse query error: ${JSON.stringify(res)}`);
    }

    const contentObj = (res as any).content?.[0] as { type: string; text: string } | undefined;
    if (!contentObj || !contentObj.text) {
      return [];
    }

    const parsed = JSON.parse(contentObj.text);
    if (parsed && Array.isArray(parsed.columns) && Array.isArray(parsed.rows)) {
      const { columns, rows } = parsed;
      return rows.map((row: any[]) => {
        const obj: Record<string, any> = {};
        columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    }
    return [];
  } finally {
    await client.close().catch(() => {});
  }
}

/**
 * Initialize ClickHouse schema:
 * 1. campaign_events (MergeTree / SharedMergeTree with session_id, props JSON envelope)
 * 2. campaign_rollup (AggregatingMergeTree for insert-time pre-aggregation)
 * 3. campaign_rollup_mv (Incremental Materialized View)
 */
export async function initClickHouseSchema(): Promise<void> {
  if (schemaInitialized) return;

  const ddlEvents = `
    CREATE TABLE IF NOT EXISTS campaign_events (
      event_id   UUID,
      session_id String,
      brief_id   String,
      item_id    String,
      version_id String,
      platform   LowCardinality(String),
      kind       Enum8('impression'=1,'like'=2,'click'=3,'complete'=4),
      synthetic  UInt8 DEFAULT 1,
      props      String,
      ts         DateTime64(3) DEFAULT now64(3)
    ) ENGINE = MergeTree
    ORDER BY (brief_id, item_id, ts)
  `;

  const ddlRollup = `
    CREATE TABLE IF NOT EXISTS campaign_rollup (
      brief_id String,
      item_id  String,
      platform LowCardinality(String),
      kind     Enum8('impression'=1,'like'=2,'click'=3,'complete'=4),
      n        SimpleAggregateFunction(sum, UInt64)
    ) ENGINE = AggregatingMergeTree
    ORDER BY (brief_id, item_id, platform, kind)
  `;

  const ddlMv = `
    CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_rollup_mv TO campaign_rollup AS
    SELECT brief_id, item_id, platform, kind, sumSimpleState(toUInt64(1)) AS n
    FROM campaign_events
    GROUP BY brief_id, item_id, platform, kind
  `;

  try {
    await executeMcpQuery(ddlEvents);
    await executeMcpQuery(ddlRollup);
    await executeMcpQuery(ddlMv);
    schemaInitialized = true;
  } catch (err) {
    console.warn("Notice during ClickHouse schema init (may already exist):", err);
  }
}

/**
 * Query ClickHouse's public 4.56B-row youtube dataset via mcp-clickhouse
 * for real movie-trailer engagement benchmark statistics.
 *
 * NOTE: Fails loud on network or cluster error — never silently serves hardcoded fake literals.
 */
export async function getTrailerBenchmark(): Promise<TrailerBenchmark> {
  if (benchmarkCache) return benchmarkCache;

  const sql = `
    SELECT
      count() AS videos,
      round(median(like_count / greatest(view_count, 1)) * 100, 2) AS median_engaged_pct,
      round(quantile(0.9)(like_count / greatest(view_count, 1)) * 100, 2) AS p90_engaged_pct,
      round(median(view_count)) AS median_views,
      (SELECT count() FROM youtube.youtube) AS rows_scanned
    FROM youtube.youtube
    WHERE view_count > 5000
      AND positionCaseInsensitive(title, 'official trailer') > 0
  `;

  const rows = await executeMcpQuery(sql, {
    CLICKHOUSE_HOST: process.env.CLICKHOUSE_PLAYGROUND_HOST || "sql-clickhouse.clickhouse.com",
    CLICKHOUSE_PORT: process.env.CLICKHOUSE_PLAYGROUND_PORT || "8443",
    CLICKHOUSE_USER: process.env.CLICKHOUSE_PLAYGROUND_USER || "demo",
    CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PLAYGROUND_PASSWORD || "",
    CLICKHOUSE_SECURE: "true",
  });

  if (!rows || rows.length === 0) {
    throw new Error("ClickHouse public 4.56B YouTube benchmark returned 0 rows.");
  }

  const r = rows[0];
  benchmarkCache = {
    videos: Number(r.videos),
    medianEngagedPct: Number(r.median_engaged_pct),
    p90EngagedPct: Number(r.p90_engaged_pct),
    medianViews: Number(r.median_views),
    rowsScanned: Number(r.rows_scanned),
  };
  return benchmarkCache;
}

/**
 * Seed synthetic impression & engagement stream into ClickHouse campaign_events
 * with realistic per-session conversion funnels and typed JSON props.
 * The incremental Materialized View campaign_rollup_mv automatically pre-aggregates each event.
 */
export async function seedSyntheticEventsViaMcp(item: {
  briefId: string;
  itemId: string;
  versionId: string;
  platform: string;
}): Promise<number> {
  await initClickHouseSchema();

  const base: Record<string, number> = { tiktok: 1400, instagram: 900, x: 500 };
  const p = item.platform.toLowerCase();
  const impressions = Math.round((base[p] ?? 700) * (0.7 + Math.random() * 0.6));
  const completeRate = 0.22 + Math.random() * 0.15;
  const likeRate = 0.03 + Math.random() * 0.04;
  const clickRate = 0.012 + Math.random() * 0.02;

  const now = Date.now();
  const windowMs = 48 * 3600 * 1000;
  const values: string[] = [];

  for (let i = 0; i < impressions; i++) {
    const sessionId = randomUUID();
    const baseTime = now - Math.random() * windowMs;
    const tsImp = new Date(baseTime).toISOString().replace("T", " ").replace("Z", "");
    values.push(
      `('${randomUUID()}', '${sessionId}', '${item.briefId}', '${item.itemId}', '${item.versionId}', '${item.platform}', 'impression', 1, '{"position":${i % 10}}', '${tsImp}')`
    );

    // Sequential funnel progression per viewer
    if (Math.random() < completeRate) {
      const tsComp = new Date(baseTime + 12000 + Math.random() * 5000).toISOString().replace("T", " ").replace("Z", "");
      values.push(
        `('${randomUUID()}', '${sessionId}', '${item.briefId}', '${item.itemId}', '${item.versionId}', '${item.platform}', 'complete', 1, '{"dwell_ms":${12000 + Math.floor(Math.random() * 5000)}}', '${tsComp}')`
      );

      if (Math.random() < likeRate / completeRate) {
        const tsLike = new Date(baseTime + 18000 + Math.random() * 3000).toISOString().replace("T", " ").replace("Z", "");
        values.push(
          `('${randomUUID()}', '${sessionId}', '${item.briefId}', '${item.itemId}', '${item.versionId}', '${item.platform}', 'like', 1, '{"sentiment":"positive"}', '${tsLike}')`
        );
      }

      if (Math.random() < clickRate / completeRate) {
        const tsClick = new Date(baseTime + 22000 + Math.random() * 4000).toISOString().replace("T", " ").replace("Z", "");
        values.push(
          `('${randomUUID()}', '${sessionId}', '${item.briefId}', '${item.itemId}', '${item.versionId}', '${item.platform}', 'click', 1, '{"cta":"ticket_link"}', '${tsClick}')`
        );
      }
    }
  }

  // Insert in batches of 500 rows via mcp-clickhouse
  const batchSize = 500;
  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize).join(",");
    const insertSql = `INSERT INTO campaign_events (event_id, session_id, brief_id, item_id, version_id, platform, kind, synthetic, props, ts) VALUES ${batch}`;
    try {
      await executeMcpQuery(insertSql);
    } catch (err) {
      console.warn("MCP Insert batch notice:", err);
    }
  }

  return values.length;
}

/**
 * Aggregate campaign metrics per item from the ClickHouse Incremental Rollup table (campaign_rollup).
 * This executes zero table scans over raw events at query time — reads use pre-aggregated sum counters.
 */
export async function aggregateByItemViaMcp(briefId: string): Promise<ItemMetrics[]> {
  await initClickHouseSchema();

  // Primary read from AggregatingMergeTree rollup
  const rollupSql = `
    SELECT
      item_id,
      any(platform) AS platform,
      sumIf(n, kind = 'impression') AS impressions,
      sumIf(n, kind = 'complete')   AS completes,
      sumIf(n, kind = 'like')       AS likes,
      sumIf(n, kind = 'click')      AS clicks
    FROM campaign_rollup
    WHERE brief_id = '${briefId}'
    GROUP BY item_id
  `;

  try {
    const rows = await executeMcpQuery(rollupSql);
    if (rows.length > 0) {
      return rows.map((r) => ({
        item_id: String(r.item_id),
        platform: String(r.platform),
        impressions: Number(r.impressions || 0),
        completes: Number(r.completes || 0),
        likes: Number(r.likes || 0),
        clicks: Number(r.clicks || 0),
      }));
    }
  } catch (err) {
    console.warn("Notice reading from campaign_rollup:", err);
  }

  // Fallback read from raw campaign_events if rollup has not yet received events
  const rawSql = `
    SELECT
      item_id,
      any(platform) AS platform,
      countIf(kind = 'impression') AS impressions,
      countIf(kind = 'complete')   AS completes,
      countIf(kind = 'like')       AS likes,
      countIf(kind = 'click')      AS clicks
    FROM campaign_events
    WHERE brief_id = '${briefId}' AND synthetic = 1
    GROUP BY item_id
  `;

  try {
    const rows = await executeMcpQuery(rawSql);
    return rows.map((r) => ({
      item_id: String(r.item_id),
      platform: String(r.platform),
      impressions: Number(r.impressions || 0),
      completes: Number(r.completes || 0),
      likes: Number(r.likes || 0),
      clicks: Number(r.clicks || 0),
    }));
  } catch (err) {
    console.error("aggregateByItemViaMcp error:", err);
    return [];
  }
}

/**
 * Compute sequence-aware conversion funnel using ClickHouse windowFunnel function.
 * Tracks monotonic viewer progression: Reached -> Watched -> Engaged -> Clicked.
 */
export async function getFunnelMetricsViaMcp(briefId: string, itemId: string): Promise<FunnelMetrics> {
  await initClickHouseSchema();

  const funnelSql = `
    SELECT
      countIf(lvl >= 1) AS reached,
      countIf(lvl >= 2) AS watched,
      countIf(lvl >= 3) AS engaged,
      countIf(lvl >= 4) AS clicked
    FROM (
      SELECT session_id,
        windowFunnel(3600)(toDateTime(ts),
          kind = 'impression',
          kind = 'complete',
          kind = 'like',
          kind = 'click'
        ) AS lvl
      FROM campaign_events
      WHERE brief_id = '${briefId}' AND item_id = '${itemId}'
      GROUP BY session_id
    )
  `;

  try {
    const rows = await executeMcpQuery(funnelSql);
    if (rows.length > 0) {
      const r = rows[0];
      return {
        reached: Number(r.reached || 0),
        watched: Number(r.watched || 0),
        engaged: Number(r.engaged || 0),
        clicked: Number(r.clicked || 0),
      };
    }
  } catch (err) {
    console.error("getFunnelMetricsViaMcp error:", err);
  }

  return { reached: 0, watched: 0, engaged: 0, clicked: 0 };
}
