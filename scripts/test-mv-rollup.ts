import { executeMcpQuery } from "../lib/clickhouse-mcp";
import { randomUUID } from "node:crypto";

async function test() {
  console.log("Testing ClickHouse Incremental MV -> AggregatingMergeTree rollup...");
  const briefId = "test-mv-brief-" + Date.now();
  const itemId = "item-alpha";
  const now = new Date().toISOString().replace("T", " ").replace("Z", "");

  // Insert 4 test events into campaign_events
  const insertSql = `INSERT INTO campaign_events (event_id, session_id, brief_id, item_id, version_id, platform, kind, synthetic, props, ts) VALUES
    ('${randomUUID()}', 'sess-viewer-1', '${briefId}', '${itemId}', 'v1', 'tiktok', 'impression', 1, '{"dwell_ms":3500}', '${now}'),
    ('${randomUUID()}', 'sess-viewer-1', '${briefId}', '${itemId}', 'v1', 'tiktok', 'complete', 1, '{"dwell_ms":12000}', '${now}'),
    ('${randomUUID()}', 'sess-viewer-1', '${briefId}', '${itemId}', 'v1', 'tiktok', 'like', 1, '{"dwell_ms":12500}', '${now}'),
    ('${randomUUID()}', 'sess-viewer-1', '${briefId}', '${itemId}', 'v1', 'tiktok', 'click', 1, '{"dwell_ms":13000}', '${now}')
  `;
  await executeMcpQuery(insertSql);
  console.log("✓ Inserted 4 test events into campaign_events via mcp-clickhouse");

  // Query campaign_rollup
  const rollupSql = `
    SELECT item_id, any(platform) AS platform,
      sumIf(n, kind='impression') AS impressions,
      sumIf(n, kind='complete')   AS completes,
      sumIf(n, kind='like')       AS likes,
      sumIf(n, kind='click')      AS clicks
    FROM campaign_rollup
    WHERE brief_id = '${briefId}'
    GROUP BY item_id
  `;
  const rollupRows = await executeMcpQuery(rollupSql);
  console.log("✓ Rollup rows aggregated by MV at insert time:", rollupRows);

  if (rollupRows.length > 0 && Number(rollupRows[0].impressions) >= 1) {
    console.log("🎉 SUCCESS: Incremental MV automatically pre-aggregated into campaign_rollup!");
  } else {
    throw new Error("MV rollup returned empty or invalid results!");
  }
}

test().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
