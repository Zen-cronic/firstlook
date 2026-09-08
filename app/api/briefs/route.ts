import { NextRequest, NextResponse } from "next/server";
import { getDb, Brief, Asset } from "@/lib/db";
import { getUploadPath } from "@/lib/storage";
import { probeMedia, extractThumbnail } from "@/lib/ffprobe";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const db = getDb();
  const briefs = db.prepare("SELECT * FROM briefs ORDER BY created_at DESC").all() as unknown as Brief[];

  const result = briefs.map((b) => {
    const assets = db.prepare("SELECT * FROM assets WHERE brief_id = ?").all(b.id) as unknown as Asset[];
    const versionsCount = (
      db.prepare("SELECT COUNT(*) as cnt FROM creative_versions WHERE brief_id = ?").get(b.id) as { cnt: number }
    ).cnt;

    return {
      ...b,
      assets,
      versionsCount,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const logline = formData.get("logline") as string;
  const genre = formData.get("genre") as string;
  const targetAudience = formData.get("targetAudience") as string;
  const releaseDate = formData.get("releaseDate") as string;

  if (!title || !logline) {
    return NextResponse.json({ error: "Title and logline are required." }, { status: 400 });
  }

  const briefId = randomUUID();
  db.prepare(`
    INSERT INTO briefs (id, title, logline, genre, target_audience, release_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(briefId, title, logline, genre || "Feature Film", targetAudience || "General Audience", releaseDate || "2026-10-01");

  const files = formData.getAll("files") as File[];
  let posterPath = "";

  for (const file of files) {
    if (!file || typeof file === "string") continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".mp4";
    const filename = `${briefId}_${randomUUID()}${ext}`;
    const filePath = getUploadPath(filename);

    fs.writeFileSync(filePath, buffer);

    const isImage = file.type.startsWith("image/") || [".jpg", ".jpeg", ".png"].includes(ext.toLowerCase());
    const kind = isImage ? "poster" : "clip";

    if (kind === "poster" && !posterPath) {
      posterPath = filename;
    }

    let probe = { durationSeconds: 10, width: 1920, height: 1080, fps: 30 };
    let thumbFilename = filename;

    if (kind === "clip") {
      probe = await probeMedia(filePath);
      thumbFilename = `thumb_${filename}.jpg`;
      const thumbPath = getUploadPath(thumbFilename);
      await extractThumbnail(filePath, thumbPath, 1);
    }

    db.prepare(`
      INSERT INTO assets (id, brief_id, kind, file_path, original_name, duration_seconds, width, height, fps, thumbnail_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      briefId,
      kind,
      filename,
      file.name,
      probe.durationSeconds,
      probe.width,
      probe.height,
      probe.fps,
      thumbFilename
    );
  }

  if (posterPath) {
    db.prepare("UPDATE briefs SET poster_path = ? WHERE id = ?").run(posterPath, briefId);
  }

  return NextResponse.json({ briefId });
}
