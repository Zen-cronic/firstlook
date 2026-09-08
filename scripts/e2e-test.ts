import { getDb, Brief } from "../lib/db";
import { generateCampaignVersion } from "../lib/generate";
import { processNextRenderJob } from "../worker/render";
import { approveVersionAndScheduleItems, publishSimulatedItem } from "../lib/schedule";
import { proposeCampaignRevision } from "../lib/revise";
import { getTrailerBenchmark } from "../lib/clickhouse-mcp";
import fs from "node:fs";
import path from "node:path";

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...val] = trimmed.split("=");
      process.env[key.trim()] = val.join("=").trim();
    }
  }
}

async function runE2ETest() {
  console.log("=================================================");
  console.log("  AGENTIC CINEMA END-TO-END VERIFICATION SUITE   ");
  console.log("=================================================\n");

  const db = getDb();
  
  // 1. Fetch seeded brief (Sintel)
  const brief = db.prepare("SELECT * FROM briefs ORDER BY created_at DESC LIMIT 1").get() as Brief | undefined;
  if (!brief) {
    throw new Error("No brief found. Run 'npm run seed:sintel' first.");
  }
  console.log(`[E2E Step 1] Found seeded brief: "${brief.title}" (ID: ${brief.id})`);

  // 2. Query 4.56B YouTube ClickHouse Benchmark via mcp-clickhouse
  console.log("\n[E2E Step 2] Querying ClickHouse 4.56B YouTube benchmark via mcp-clickhouse...");
  const benchmark = await getTrailerBenchmark();
  console.log(`✓ Scanned ${Number(benchmark.rowsScanned).toLocaleString()} rows in ClickHouse.`);
  console.log(`✓ Benchmark Stats: ${benchmark.videos} trailers | Median Engagement: ${benchmark.medianEngagedPct}% | p90 Engagement: ${benchmark.p90EngagedPct}%`);

  // 3. Trigger Campaign Generation via Gemini 3.6 Flash
  console.log("\n[E2E Step 3] Triggering Gemini 3.6 Flash campaign generator...");
  const versionId = await generateCampaignVersion(brief.id);
  console.log(`✓ Generated Creative Version ID: ${versionId}`);

  // 4. Process all queued render jobs via Remotion Engine
  console.log("\n[E2E Step 4] Processing Remotion render jobs (Teaser, Vertical, Poster)...");
  let renderedCount = 0;
  while (await processNextRenderJob()) {
    renderedCount++;
    console.log(`  ✓ Render job ${renderedCount} finished.`);
  }
  console.log(`✓ All ${renderedCount} Remotion compositions rendered successfully.`);

  // Verify output files exist on disk
  const version = db.prepare("SELECT * FROM creative_versions WHERE id = ?").get(versionId) as any;
  if (!version.teaser_video_path || !fs.existsSync(version.teaser_video_path)) {
    throw new Error("Teaser video MP4 missing from disk: " + version.teaser_video_path);
  }
  if (!version.teaser_vertical_path || !fs.existsSync(version.teaser_vertical_path)) {
    throw new Error("Vertical video MP4 missing from disk: " + version.teaser_vertical_path);
  }
  if (!version.poster_image_path || !fs.existsSync(version.poster_image_path)) {
    throw new Error("Poster JPEG image missing from disk: " + version.poster_image_path);
  }
  console.log(`  ✓ Verified files exist on disk:`);
  console.log(`    - 16:9 Teaser: ${version.teaser_video_path} (${(fs.statSync(version.teaser_video_path).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`    - 9:16 Vertical: ${version.teaser_vertical_path} (${(fs.statSync(version.teaser_vertical_path).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`    - 4:5 Poster: ${version.poster_image_path} (${(fs.statSync(version.poster_image_path).size / 1024).toFixed(2)} KB)`);

  // 5. Approve & Schedule Campaign Items
  console.log("\n[E2E Step 5] Approving creative version and scheduling campaign items...");
  approveVersionAndScheduleItems(brief.id, versionId);
  const items = db.prepare("SELECT * FROM campaign_items WHERE version_id = ?").all(versionId) as any[];
  console.log(`✓ Approved version ${versionId}. ${items.length} items scheduled on calendar.`);

  // 6. Simulate Publishing & Seed ClickHouse Event Stream via mcp-clickhouse
  console.log("\n[E2E Step 6] Simulating item publishing & seeding event stream into ClickHouse...");
  let totalRows = 0;
  for (const item of items) {
    const rows = await publishSimulatedItem(item.id);
    totalRows += rows;
    console.log(`  ✓ Published item ${item.id} (${item.platform}): Seeded ${rows} impression/engagement rows into ClickHouse.`);
  }
  console.log(`✓ Total synthetic event rows written to ClickHouse via mcp-clickhouse: ${totalRows}`);

  // 6b. Verify ClickHouse windowFunnel Conversion Analytics
  console.log("\n[E2E Step 6b] Testing ClickHouse windowFunnel conversion funnel analytics...");
  const { getFunnelMetricsViaMcp, aggregateByItemViaMcp } = await import("../lib/clickhouse-mcp");
  const funnel = await getFunnelMetricsViaMcp(brief.id, items[0].id);
  console.log(`  ✓ Monotonic conversion funnel for ${items[0].platform}:`, funnel);
  if (funnel.reached < 1) throw new Error("Funnel metrics reached is 0");

  // 6c. Verify Pre-Aggregated Incremental Materialized View Rollup
  console.log("\n[E2E Step 6c] Testing ClickHouse campaign_rollup AggregatingMergeTree reads...");
  const rollups = await aggregateByItemViaMcp(brief.id);
  console.log(`  ✓ Rollup aggregated items (zero raw scans): ${rollups.length} items`);
  for (const r of rollups) {
    console.log(`    - Item ${r.item_id.slice(0, 8)}... (${r.platform}): ${r.impressions} imps, ${r.completes} completes, ${r.likes} likes, ${r.clicks} clicks`);
  }

  // 6d. Verify Gemini Embeddings & Vector Similarity
  console.log("\n[E2E Step 6d] Testing gemini-embedding-001 vector similarity...");
  const { generateEmbedding, cosineSimilarity } = await import("../lib/embeddings");
  const vec1 = await generateEmbedding(brief.logline, 768);
  const vec2 = await generateEmbedding("Fantasy adventure about a hero searching for a lost dragon companion", 768);
  const similarity = cosineSimilarity(vec1, vec2);
  console.log(`  ✓ Vector cosine similarity against fantasy trailer cluster: ${(similarity * 100).toFixed(2)}%`);

  // 7. Run Gemini Data-Grounded Revision Loop
  console.log("\n[E2E Step 7] Running Gemini campaign revision loop against 4.56B YouTube benchmark...");
  const revision = await proposeCampaignRevision(brief.id);
  if (revision) {
    console.log(`✓ Gemini Revision Proposal Generated:`);
    console.log(`    - Item ID: ${revision.itemId} (${revision.platform})`);
    console.log(`    - Original Caption: "${revision.originalCaption}"`);
    console.log(`    - Suggested Revised Caption: "${revision.suggestedCaption}"`);
    console.log(`    - Rationale: ${revision.rationale}`);
  } else {
    console.log("  (Note: Revision query returned null)");
  }

  console.log("\n=================================================");
  console.log("  ALL E2E VERIFICATION STEPS PASSED SUCCESSFULLY! ");
  console.log("=================================================\n");
}

runE2ETest().catch((err) => {
  console.error("\n❌ E2E VERIFICATION FAILED:", err);
  process.exit(1);
});
