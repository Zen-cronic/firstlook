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

export async function uploadToGCS(localFilePath: string, destinationName: string): Promise<string | null> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  const storage = getGCSClient();
  
  if (!storage || !bucketName) {
    return null; // Fallback to local storage path
  }

  try {
    const bucket = storage.bucket(bucketName);
    await bucket.upload(localFilePath, {
      destination: destinationName,
      resumable: false,
    });
    console.log(`Uploaded ${localFilePath} to Google Cloud Storage: gs://${bucketName}/${destinationName}`);
    return `https://storage.googleapis.com/${bucketName}/${destinationName}`;
  } catch (err) {
    console.error("GCS upload error:", err);
    return null;
  }
}
