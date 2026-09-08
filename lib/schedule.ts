import { getDb, CampaignItem } from "./db";
import { seedSyntheticEventsViaMcp } from "./clickhouse-mcp";

export function approveVersionAndScheduleItems(briefId: string, versionId: string) {
  const db = getDb();

  // Mark version as approved
  db.prepare("UPDATE creative_versions SET status = 'draft' WHERE brief_id = ?").run(briefId);
  db.prepare("UPDATE creative_versions SET status = 'approved' WHERE id = ?").run(versionId);

  // Update item states to scheduled
  db.prepare("UPDATE campaign_items SET state = 'scheduled' WHERE version_id = ?").run(versionId);
}

export async function publishSimulatedItem(itemId: string): Promise<number> {
  const db = getDb();
  const item = db.prepare("SELECT * FROM campaign_items WHERE id = ?").get(itemId) as CampaignItem | undefined;
  if (!item) throw new Error(`Campaign item ${itemId} not found.`);

  const now = new Date().toISOString();
  db.prepare("UPDATE campaign_items SET state = 'published_sim', published_at = ? WHERE id = ?").run(now, itemId);

  // Seed realistic engagement rows into ClickHouse via mcp-clickhouse
  const rowsWritten = await seedSyntheticEventsViaMcp({
    briefId: item.brief_id,
    itemId: item.id,
    versionId: item.version_id,
    platform: item.platform,
  });

  return rowsWritten;
}
