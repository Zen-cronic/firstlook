import path from "node:path";
import fs from "node:fs";
import { Storage } from "@google-cloud/storage";

const BASE_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.cwd(), process.env.STORAGE_DIR)
  : path.resolve(process.cwd(), "storage");

export const UPLOADS_DIR = path.join(BASE_DIR, "uploads");
export const RENDERS_DIR = path.join(BASE_DIR, "renders");

export function ensureStorageDirs() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(RENDERS_DIR)) {
    fs.mkdirSync(RENDERS_DIR, { recursive: true });
  }
}

ensureStorageDirs();

export function getUploadPath(filename: string): string {
  ensureStorageDirs();
  return path.join(UPLOADS_DIR, filename);
}

export function getRenderPath(briefId: string, filename: string): string {
  ensureStorageDirs();
  const dir = path.join(RENDERS_DIR, briefId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, filename);
}

// Google Cloud Storage Integration
let gcsClient: Storage | null = null;

export function getGCSClient(): Storage | null {
  if (gcsClient) return gcsClient;
  if (process.env.GCS_BUCKET_NAME || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      gcsClient = new Storage();
      return gcsClient;
    } catch (err) {
      console.warn("Google Cloud Storage client initialization note:", err);
      return null;
    }
  }
  return null;
}

export function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".mp3": "audio/mpeg",
    ".json": "application/json",
    ".txt": "text/plain",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export async function uploadToGCS(localFilePath: string, destinationName: string): Promise<string | null> {
  const bucketName = process.env.GCS_BUCKET_NAME || "agentic-cinema-2026-media";
  const contentType = getContentType(localFilePath);

  // 1. Try official @google-cloud/storage (works on Cloud Run via Compute Engine service account / ADC)
  const storage = getGCSClient();
  if (storage) {
    try {
      const bucket = storage.bucket(bucketName);
      await bucket.upload(localFilePath, {
        destination: destinationName,
        resumable: false,
        metadata: {
          contentType,
        },
      });
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationName}`;
      console.log(`[Storage] Uploaded to GCS via SDK: ${publicUrl}`);
      return publicUrl;
    } catch (err: any) {
      console.warn(`[Storage] GCS SDK upload fallback notice: ${err?.message || err}`);
    }
  }

  // 2. Resilient fallback for local / CLI execution using gcloud access token
  try {
    const { execSync } = await import("node:child_process");
    let token = process.env.GOOGLE_ACCESS_TOKEN;
    if (!token) {
      try {
        token = execSync("gcloud auth print-access-token", { encoding: "utf-8" }).trim();
      } catch {
        // No gcloud token available
      }
    }

    if (token) {
      const fileBuffer = fs.readFileSync(localFilePath);
      const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(destinationName)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType,
        },
        body: fileBuffer,
      });

      if (res.ok) {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationName}`;
        console.log(`[Storage] Uploaded to GCS via REST: ${publicUrl}`);
        return publicUrl;
      } else {
        const errText = await res.text();
        console.warn(`[Storage] GCS REST upload response (${res.status}):`, errText);
      }
    }
  } catch (fallbackErr: any) {
    console.warn(`[Storage] GCS fallback error:`, fallbackErr?.message || fallbackErr);
  }

  return null;
}
