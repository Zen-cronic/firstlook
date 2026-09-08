import Database from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "app.sqlite");

let _db: Database.DatabaseSync | null = null;

export function getDb(): Database.DatabaseSync {
  if (_db) return _db;
  _db = new Database.DatabaseSync(DB_PATH);
  _db.exec("PRAGMA journal_mode = WAL;");
  _db.exec("PRAGMA foreign_keys = ON;");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS briefs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      logline TEXT NOT NULL,
      genre TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      release_date TEXT NOT NULL,
      poster_path TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      brief_id TEXT NOT NULL,
      kind TEXT NOT NULL, -- 'clip' | 'poster' | 'audio'
      file_path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      duration_seconds REAL,
      width INTEGER,
      height INTEGER,
      fps REAL,
      thumbnail_path TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS creative_versions (
      id TEXT PRIMARY KEY,
      brief_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'approved'
      plan_json TEXT NOT NULL,
      teaser_video_path TEXT,
      teaser_vertical_path TEXT,
      poster_image_path TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS campaign_items (
      id TEXT PRIMARY KEY,
      brief_id TEXT NOT NULL,
      version_id TEXT NOT NULL,
      platform TEXT NOT NULL, -- 'tiktok' | 'instagram' | 'x'
      asset_kind TEXT NOT NULL, -- 'teaser' | 'teaser_vertical' | 'poster'
      caption TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'scheduled' | 'published_sim'
      published_at TEXT,
      honesty_label TEXT NOT NULL DEFAULT 'Simulated Campaign Post · No real accounts modified',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE,
      FOREIGN KEY (version_id) REFERENCES creative_versions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS render_jobs (
      id TEXT PRIMARY KEY,
      brief_id TEXT NOT NULL,
      version_id TEXT NOT NULL,
      composition_id TEXT NOT NULL, -- 'Teaser' | 'TeaserVertical' | 'PosterPost'
      input_props_json TEXT NOT NULL,
      output_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
      error TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export interface Brief {
  id: string;
  title: string;
  logline: string;
  genre: string;
  target_audience: string;
  release_date: string;
  poster_path: string | null;
  created_at: string;
}

export interface Asset {
  id: string;
  brief_id: string;
  kind: "clip" | "poster" | "audio";
  file_path: string;
  original_name: string;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  thumbnail_path: string | null;
  created_at: string;
}

export interface CreativeVersion {
  id: string;
  brief_id: string;
  version_number: number;
  status: "draft" | "approved";
  plan_json: string;
  teaser_video_path: string | null;
  teaser_vertical_path: string | null;
  poster_image_path: string | null;
  created_at: string;
}

export interface CampaignItem {
  id: string;
  brief_id: string;
  version_id: string;
  platform: "tiktok" | "instagram" | "x";
  asset_kind: "teaser" | "teaser_vertical" | "poster";
  caption: string;
  scheduled_at: string;
  state: "draft" | "scheduled" | "published_sim";
  published_at: string | null;
  honesty_label: string;
  created_at: string;
}

export interface RenderJob {
  id: string;
  brief_id: string;
  version_id: string;
  composition_id: string;
  input_props_json: string;
  output_path: string;
  status: "pending" | "processing" | "completed" | "failed";
  error: string | null;
  created_at: string;
  updated_at: string;
}
