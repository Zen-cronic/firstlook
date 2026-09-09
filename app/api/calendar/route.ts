import { NextRequest, NextResponse } from "next/server";
import { getDb, Brief, CampaignItem, CreativeVersion } from "@/lib/db";
import { randomUUID } from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const briefId = searchParams.get("briefId");

    if (!briefId) {
      return NextResponse.json({ error: "briefId is required" }, { status: 400 });
    }

    const db = getDb();
    const brief = db.prepare("SELECT * FROM briefs WHERE id = ?").get(briefId) as Brief | undefined;
    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    let items = db
      .prepare("SELECT * FROM campaign_items WHERE brief_id = ? ORDER BY scheduled_at ASC")
      .all(briefId) as unknown as CampaignItem[];

    // If no campaign items exist yet, seed standard pre-release items for this brief
    if (!items || items.length === 0) {
      const latestVersion = db
        .prepare("SELECT * FROM creative_versions WHERE brief_id = ? ORDER BY version_number DESC LIMIT 1")
        .get(briefId) as CreativeVersion | undefined;

      const versionId = latestVersion ? latestVersion.id : randomUUID();
      const releaseDateObj = new Date(brief.release_date || "2026-10-24");

      const defaultItems = [
        {
          platform: "tiktok",
          assetKind: "teaser_vertical",
          caption: `In a world of fire and snow, one search changes everything. #${brief.title.replace(/\s+/g, "")} #FantasyCinema`,
          daysOffset: -30,
          state: "scheduled",
        },
        {
          platform: "instagram",
          assetKind: "poster",
          caption: `Find the dragon. Official teaser poster for ${brief.title.toUpperCase()}. Coming to theaters ${brief.release_date}.`,
          daysOffset: -21,
          state: "scheduled",
        },
        {
          platform: "x",
          assetKind: "teaser",
          caption: `Your past will hunt you down. Watch the official 16:9 teaser trailer for ${brief.title}.`,
          daysOffset: -14,
          state: "published_sim",
        },
        {
          platform: "tiktok",
          assetKind: "teaser_vertical",
          caption: `Exclusive footage: Sintel uncovers the ancient dragon marker. #${brief.title.replace(/\s+/g, "")} #TrailerDrop`,
          daysOffset: -7,
          state: "scheduled",
        },
        {
          platform: "instagram",
          assetKind: "teaser",
          caption: `Behind the score: Original Lyria soundtrack preview for ${brief.title}. Save the release date.`,
          daysOffset: -3,
          state: "scheduled",
        },
        {
          platform: "x",
          assetKind: "poster",
          caption: `Premiere night countdown: 24 hours until ${brief.title} releases worldwide. Are you ready?`,
          daysOffset: -1,
          state: "scheduled",
        },
      ];

      for (const item of defaultItems) {
        const scheduledTime = new Date(releaseDateObj.getTime() + item.daysOffset * 24 * 3600 * 1000).toISOString();
        const itemId = randomUUID();
        db.prepare(`
          INSERT INTO campaign_items (id, brief_id, version_id, platform, asset_kind, caption, scheduled_at, state, honesty_label)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Simulated Campaign Post · No real accounts modified')
        `).run(itemId, briefId, versionId, item.platform, item.assetKind, item.caption, scheduledTime, item.state);
      }

      items = db
        .prepare("SELECT * FROM campaign_items WHERE brief_id = ? ORDER BY scheduled_at ASC")
        .all(briefId) as unknown as CampaignItem[];
    }

    const releaseTime = new Date(brief.release_date).getTime();

    const formattedItems = items.map((item) => {
      const itemTime = new Date(item.scheduled_at).getTime();
      const diffDays = Math.round((itemTime - releaseTime) / (24 * 3600 * 1000));
      const daysStr = diffDays < 0 ? `${diffDays} Days` : `+${diffDays} Days`;

      return {
        id: item.id,
        platform: item.platform,
        assetKind: item.asset_kind,
        caption: item.caption,
        scheduledAt: item.scheduled_at,
        days: daysStr,
        state: item.state,
        publishedAt: item.published_at,
        honestyLabel: item.honesty_label,
      };
    });

    return NextResponse.json({ items: formattedItems });
  } catch (err: any) {
    console.error("Failed to load calendar items:", err);
    return NextResponse.json({ error: err.message || "Failed to load calendar items" }, { status: 500 });
  }
}
