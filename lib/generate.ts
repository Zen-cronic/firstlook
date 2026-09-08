import { getDb, Brief, Asset } from "./db";
import { createCampaignPlan } from "./campaign-plan";
import { getRenderPath } from "./storage";
import { randomUUID } from "node:crypto";

export async function generateCampaignVersion(briefId: string): Promise<string> {
  const db = getDb();

  const brief = db.prepare("SELECT * FROM briefs WHERE id = ?").get(briefId) as Brief | undefined;
  if (!brief) throw new Error(`Brief ${briefId} not found.`);

  const assets = db.prepare("SELECT * FROM assets WHERE brief_id = ?").all(briefId) as unknown as Asset[];
  const videoClips = assets.filter((a) => a.kind === "clip");
  const posterAssets = assets.filter((a) => a.kind === "poster");

  // Determine next version number
  const lastVer = db
    .prepare("SELECT MAX(version_number) as max_v FROM creative_versions WHERE brief_id = ?")
    .get(briefId) as { max_v: number | null };
  const versionNumber = (lastVer?.max_v || 0) + 1;

  console.log(`Generating campaign version ${versionNumber} for brief "${brief.title}"...`);

  // Generate grounded campaign plan via Gemini
  const plan = await createCampaignPlan({
    title: brief.title,
    logline: brief.logline,
    genre: brief.genre,
    targetAudience: brief.target_audience,
    releaseDate: brief.release_date,
    assets: videoClips.map((c) => ({ filename: c.original_name, duration: c.duration_seconds || 10 })),
  });

  const versionId = randomUUID();

  // Save version
  db.prepare(`
    INSERT INTO creative_versions (id, brief_id, version_number, status, plan_json)
    VALUES (?, ?, ?, 'draft', ?)
  `).run(versionId, briefId, versionNumber, JSON.stringify(plan));

  // Prepare composition props
  const clipsProps = videoClips.map((c) => ({
    src: `/storage/uploads/${c.file_path}`,
    durationInFrames: Math.round((c.duration_seconds || 5) * 30),
    isProxy: false,
  }));

  const posterPath = posterAssets[0] ? `/storage/uploads/${posterAssets[0].file_path}` : "";

  // Queue Teaser render job (16:9)
  const teaserOutputPath = getRenderPath(briefId, `version_${versionNumber}_teaser.mp4`);
  db.prepare(`
    INSERT INTO render_jobs (id, brief_id, version_id, composition_id, input_props_json, output_path, status)
    VALUES (?, ?, ?, 'Teaser', ?, ?, 'pending')
  `).run(
    randomUUID(),
    briefId,
    versionId,
    JSON.stringify({
      title: plan.filmTitle || brief.title,
      tagline: plan.tagline,
      clips: clipsProps,
      captions: plan.captions,
      teaserDurationInFrames: clipsProps.reduce((acc, c) => acc + c.durationInFrames, 0) || 300,
    }),
    teaserOutputPath
  );

  // Queue TeaserVertical render job (9:16)
  const verticalOutputPath = getRenderPath(briefId, `version_${versionNumber}_vertical.mp4`);
  db.prepare(`
    INSERT INTO render_jobs (id, brief_id, version_id, composition_id, input_props_json, output_path, status)
    VALUES (?, ?, ?, 'TeaserVertical', ?, ?, 'pending')
  `).run(
    randomUUID(),
    briefId,
    versionId,
    JSON.stringify({
      title: plan.filmTitle || brief.title,
      tagline: plan.tagline,
      clips: clipsProps,
      captions: plan.captions,
      teaserDurationInFrames: clipsProps.reduce((acc, c) => acc + c.durationInFrames, 0) || 300,
    }),
    verticalOutputPath
  );

  // Queue PosterPost render job (4:5)
  const posterOutputPath = getRenderPath(briefId, `version_${versionNumber}_poster.jpeg`);
  db.prepare(`
    INSERT INTO render_jobs (id, brief_id, version_id, composition_id, input_props_json, output_path, status)
    VALUES (?, ?, ?, 'PosterPost', ?, ?, 'pending')
  `).run(
    randomUUID(),
    briefId,
    versionId,
    JSON.stringify({
      title: plan.filmTitle || brief.title,
      tagline: plan.tagline,
      imageSrc: posterPath,
      releaseDate: brief.release_date,
      isProxy: posterPath ? false : true,
    }),
    posterOutputPath
  );

  // Create scheduled campaign items based on plan
  const releaseDateObj = new Date(brief.release_date);

  for (const post of plan.socialPosts) {
    const scheduledDate = new Date(releaseDateObj.getTime() + post.scheduledDaysOffset * 24 * 3600 * 1000);
    db.prepare(`
      INSERT INTO campaign_items (id, brief_id, version_id, platform, asset_kind, caption, scheduled_at, state, honesty_label)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 'Simulated Campaign Post · No real accounts modified')
    `).run(
      randomUUID(),
      briefId,
      versionId,
      post.platform,
      post.assetKind,
      post.captionText,
      scheduledDate.toISOString()
    );
  }

  return versionId;
}
