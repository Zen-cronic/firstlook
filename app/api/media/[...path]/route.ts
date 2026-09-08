import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const storageDir = process.env.STORAGE_DIR
    ? path.resolve(process.cwd(), process.env.STORAGE_DIR)
    : path.resolve(process.cwd(), "storage");

  const filePath = path.join(storageDir, ...pathSegments);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const bucketName = process.env.GCS_BUCKET_NAME || "agentic-cinema-2026-media";
    const gcsUrl = `https://storage.googleapis.com/${bucketName}/${pathSegments.join("/")}`;
    return NextResponse.redirect(gcsUrl, 307);
  }

  const fileStream = fs.createReadStream(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".mp3": "audio/mpeg",
  };

  const headers = new Headers();
  headers.set("Content-Type", mimeTypes[ext] || "application/octet-stream");

  // @ts-ignore
  return new NextResponse(fileStream, { headers });
}
