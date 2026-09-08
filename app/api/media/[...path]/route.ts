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
    return new NextResponse("File Not Found", { status: 404 });
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
