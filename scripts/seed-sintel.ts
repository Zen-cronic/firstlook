import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDb } from "../lib/db";
import { getUploadPath } from "../lib/storage";
import { probeMedia, extractThumbnail } from "../lib/ffprobe";

const run = promisify(execFile);
const SINTEL_URL = "https://download.blender.org/durian/movies/Sintel.2010.1080p.mkv";

const CLIPS: { name: string; ss: number; dur: number }[] = [
  { name: "sintel-opening.mp4", ss: 44, dur: 6 },
  { name: "sintel-market.mp4", ss: 150, dur: 5 },
  { name: "sintel-scales.mp4", ss: 300, dur: 6 },
  { name: "sintel-battle.mp4", ss: 470, dur: 6 },
];

async function ff(args: string[], out: string): Promise<void> {
  if (existsSync(out)) return;
  await run("ffmpeg", ["-y", ...args, out], { maxBuffer: 1 << 26 });
}

async function main() {
  console.log("Seeding real cinema brief from Blender CC-BY film 'Sintel'...");
  const db = getDb();
  
  const cacheDir = path.resolve(process.cwd(), "storage/sintel-source");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  for (const c of CLIPS) {
    const outFile = path.join(cacheDir, c.name);
    console.log(`Extracting clip ${c.name}...`);
    await ff(
      [
        "-ss", String(c.ss),
        "-i", SINTEL_URL,
        "-t", String(c.dur),
        "-an",
        "-c:v", "libx264",
        "-crf", "23",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=1280:-2",
      ],
      outFile
    );
  }

  const posterFile = path.join(cacheDir, "sintel-poster.jpg");
  console.log("Extracting poster still...");
  await ff(
    ["-ss", "218", "-i", SINTEL_URL, "-frames:v", "1", "-update", "1", "-vf", "scale=1280:-2"],
    posterFile
  );

  const briefId = randomUUID();
  const title = "Sintel";
  const logline = "A lone warrior scours a frozen, unforgiving world for the dragon she rescued, raised, and lost.";
  const genre = "Fantasy / Action";
  const targetAudience = "Fantasy cinema lovers, action-adventure fans 18-35";
  const releaseDate = "2026-10-24";

  db.prepare(`
    INSERT INTO briefs (id, title, logline, genre, target_audience, release_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(briefId, title, logline, genre, targetAudience, releaseDate);

  console.log(`Created Brief ID: ${briefId}`);

  // Ingest clips into SQLite assets & storage/uploads
  for (const c of CLIPS) {
    const srcPath = path.join(cacheDir, c.name);
    const filename = `${briefId}_${c.name}`;
    const destPath = getUploadPath(filename);
    copyFileSync(srcPath, destPath);

    const probe = await probeMedia(destPath);
    const thumbFilename = `thumb_${filename}.jpg`;
    const thumbPath = getUploadPath(thumbFilename);
    await extractThumbnail(destPath, thumbPath, 1);

    db.prepare(`
      INSERT INTO assets (id, brief_id, kind, file_path, original_name, duration_seconds, width, height, fps, thumbnail_path)
      VALUES (?, ?, 'clip', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      briefId,
      filename,
      c.name,
      probe.durationSeconds,
      probe.width,
      probe.height,
      probe.fps,
      thumbFilename
    );
  }

  // Ingest poster
  const posterFilename = `${briefId}_sintel-poster.jpg`;
  const posterDest = getUploadPath(posterFilename);
  copyFileSync(posterFile, posterDest);

  db.prepare(`
    INSERT INTO assets (id, brief_id, kind, file_path, original_name, width, height, thumbnail_path)
    VALUES (?, ?, 'poster', ?, 'sintel-poster.jpg', 1280, 720, ?)
  `).run(randomUUID(), briefId, posterFilename, posterFilename);

  db.prepare("UPDATE briefs SET poster_path = ? WHERE id = ?").run(posterFilename, briefId);

  console.log(`\nSuccessfully seeded brief '${title}' with ID: ${briefId}`);
  console.log(`Run 'npm run worker' in a separate process to start the render engine.`);
}

main().catch((err) => {
  console.error("Sintel seed error:", err);
  process.exit(1);
});
