import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";

const execFileAsync = promisify(execFile);

export interface MediaProbeResult {
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
}

export async function probeMedia(filePath: string): Promise<MediaProbeResult> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,r_frame_rate,duration",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      filePath,
    ]);

    const data = JSON.parse(stdout);
    const stream = data.streams?.[0] || {};
    const format = data.format || {};

    const duration = parseFloat(stream.duration || format.duration || "0");
    const width = parseInt(stream.width || "0", 10);
    const height = parseInt(stream.height || "0", 10);

    let fps = 30;
    if (stream.r_frame_rate) {
      const parts = stream.r_frame_rate.split("/");
      if (parts.length === 2 && parseFloat(parts[1]) > 0) {
        fps = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else if (parseFloat(stream.r_frame_rate) > 0) {
        fps = parseFloat(stream.r_frame_rate);
      }
    }

    return {
      durationSeconds: isNaN(duration) ? 10 : duration,
      width: isNaN(width) ? 1920 : width,
      height: isNaN(height) ? 1080 : height,
      fps: isNaN(fps) ? 30 : Math.round(fps),
    };
  } catch (err) {
    console.warn("ffprobe warning, using fallback probe values:", err);
    return {
      durationSeconds: 10,
      width: 1920,
      height: 1080,
      fps: 30,
    };
  }
}

export async function extractThumbnail(
  videoPath: string,
  outputPath: string,
  seekSeconds: number = 1
): Promise<string> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-ss",
      seekSeconds.toString(),
      "-i",
      videoPath,
      "-vframes",
      "1",
      "-q:v",
      "2",
      outputPath,
    ]);
    return outputPath;
  } catch (err) {
    console.warn("ffmpeg thumbnail extraction error:", err);
    return "";
  }
}
