import path from "node:path";
import { getDb, RenderJob } from "../lib/db";
import { renderComposition } from "../lib/remotion-render";
import { uploadToGCS } from "../lib/storage";

export async function processNextRenderJob(): Promise<boolean> {
  const db = getDb();
  
  // Claim pending job
  const job = db
    .prepare("SELECT * FROM render_jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1")
    .get() as RenderJob | undefined;

  if (!job) return false;

  console.log(`[Worker] Claiming render job ${job.id} for composition ${job.composition_id}...`);
  db.prepare("UPDATE render_jobs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(job.id);

  try {
    const props = JSON.parse(job.input_props_json);
    await renderComposition({
      compositionId: job.composition_id,
      inputProps: props,
      outputPath: job.output_path,
    });

    db.prepare("UPDATE render_jobs SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(job.id);

    // Update creative version path if applicable
    if (job.composition_id === "Teaser") {
      db.prepare("UPDATE creative_versions SET teaser_video_path = ? WHERE id = ?").run(job.output_path, job.version_id);
    } else if (job.composition_id === "TeaserVertical") {
      db.prepare("UPDATE creative_versions SET teaser_vertical_path = ? WHERE id = ?").run(job.output_path, job.version_id);
    } else if (job.composition_id === "PosterPost") {
      db.prepare("UPDATE creative_versions SET poster_image_path = ? WHERE id = ?").run(job.output_path, job.version_id);
    }

    // Upload rendered deliverable to Google Cloud Storage
    try {
      const storageDir = process.env.STORAGE_DIR
        ? path.resolve(process.cwd(), process.env.STORAGE_DIR)
        : path.resolve(process.cwd(), "storage");
      const relPath = path.relative(storageDir, job.output_path);
      const destination = relPath.startsWith("..")
        ? `renders/${job.brief_id}/${path.basename(job.output_path)}`
        : relPath;
      const gcsUrl = await uploadToGCS(job.output_path, destination);
      if (gcsUrl) {
        console.log(`[Worker] Uploaded deliverable to Google Cloud Storage: ${gcsUrl}`);
      }
    } catch (gcsErr) {
      console.warn("[Worker] GCS upload notice:", gcsErr);
    }

    console.log(`[Worker] Render job ${job.id} completed successfully.`);
    return true;
  } catch (err: any) {
    console.error(`[Worker] Render job ${job.id} failed:`, err);
    db.prepare("UPDATE render_jobs SET status = 'failed', error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
      err.message || String(err),
      job.id
    );
    return false;
  }
}
