import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = path.resolve(process.cwd(), "submission/firstlook");
const AUDIO_DIR = path.join(BASE_DIR, "audio");
const VISUAL_DIR = path.join(BASE_DIR, "visuals");
const BUILD_DIR = path.join(BASE_DIR, "build");
fs.mkdirSync(BUILD_DIR, { recursive: true });

const SCENES = [
  {
    id: "beat_1_hook",
    image: path.join(VISUAL_DIR, "scene_1_hook.png"),
    title: "FIRSTLOOK - AUTONOMOUS FILM-MARKETING AGENT",
    subtitle: "Real Footage Foundation · Visible GENERATED · PROXY Badges",
  },
  {
    id: "beat_2_clickhouse_mcp",
    image: path.join(VISUAL_DIR, "scene_2_clickhouse.png"),
    title: "HERO-TECH CORE - 4,557,605,031 ROWS SCANNED",
    subtitle: "mcp-clickhouse stdio transport · 44,000+ Movie Trailers · p90 2.91%",
  },
  {
    id: "beat_3_brief",
    image: path.join(VISUAL_DIR, "scene_3_brief.png"),
    title: "GROUNDED BRIEFING - GEMINI 3.6 FLASH ORCHESTRATOR",
    subtitle: "Raw 4K Sintel Clips · Multimodal Reasoning · Spoiler Avoidance Constraints",
  },
  {
    id: "beat_4_remotion",
    image: path.join(VISUAL_DIR, "scene_4_formats.png"),
    title: "REMOTION ENGINE - PROGRAMMATIC MULTI-FORMAT SYNTHESIS",
    subtitle: "16:9 Theatrical Teaser · 9:16 Vertical (Reels/TikTok) · 4:5 Poster",
  },
  {
    id: "beat_5_calendar",
    image: path.join(VISUAL_DIR, "scene_5_calendar.png"),
    title: "HONEST CAMPAIGN CALENDAR & STATE MACHINE",
    subtitle: "Status: Published · SIM · Zero Unconsented Social Posts",
  },
  {
    id: "beat_6_revision",
    title: "CLICKHOUSE MERGETREE TELEMETRY & REVISION LOOP",
    image: path.join(VISUAL_DIR, "scene_6_revision.png"),
    subtitle: "Autonomous Benchmark Comparison · Gemini Copy Optimization",
  },
  {
    id: "beat_7_architecture",
    image: path.join(VISUAL_DIR, "scene_7_architecture.png"),
    title: "HIGH-LEVEL SYSTEM ARCHITECTURE & DATAFLOW",
    subtitle: "Next.js 15 · Gemini 3.6 Flash · Remotion 4 · ClickHouse MCP · Google Cloud Storage",
  },
  {
    id: "beat_8_closing",
    image: path.join(VISUAL_DIR, "scene_8_closing.png"),
    title: "FIRSTLOOK - TEST BEFORE YOU SPEND",
    subtitle: "Open Source · github.com/Zen-cronic/firstlook · MIT License",
  },
];

async function main() {
  console.log("=== Assembling FirstLook Demo Reel (≤ 3:00 Cap) ===");

  const segmentList: string[] = [];
  let totalDemoDuration = 0;

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const rawAudioPath = path.join(AUDIO_DIR, `${scene.id}.mp3`);
    const timedAudioPath = path.join(BUILD_DIR, `${scene.id}_timed.mp3`);
    const segmentVideoPath = path.join(BUILD_DIR, `segment_${i + 1}.mp4`);

    console.log(`\nProcessing Scene ${i + 1}: ${scene.title}...`);
    execSync(`ffmpeg -y -i "${rawAudioPath}" -filter:a "atempo=1.16" -vn "${timedAudioPath}" 2>/dev/null`);

    const durStr = execSync(`ffprobe -i "${timedAudioPath}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
    const duration = parseFloat(durStr);
    totalDemoDuration += duration;
    console.log(`Duration: ${duration.toFixed(2)}s`);

    const bannerText = scene.title.replace(/'/g, "").replace(/:/g, "\\:");
    const subText = scene.subtitle.replace(/'/g, "").replace(/:/g, "\\:");

    const vfFilters = [
      `scale=1920:1080`,
      `drawbox=x=0:y=920:w=1920:h=160:color=black@0.85:t=fill`,
      `drawbox=x=0:y=920:w=1920:h=3:color=#ef4444:t=fill`,
      `drawtext=text='${bannerText}':fontcolor=white:fontsize=30:x=60:y=948`,
      `drawtext=text='${subText}':fontcolor=#9ca3af:fontsize=20:x=60:y=996`,
    ].join(",");

    execSync(
      `ffmpeg -y -loop 1 -i "${scene.image}" -i "${timedAudioPath}" -vf "${vfFilters}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -t ${duration} "${segmentVideoPath}" 2>/dev/null`
    );

    segmentList.push(segmentVideoPath);
    console.log(`Rendered segment: ${segmentVideoPath}`);
  }

  // Create concat file
  const concatFilePath = path.join(BUILD_DIR, "concat_list.txt");
  const concatContent = segmentList.map((p) => `file '${p}'`).join("\n");
  fs.writeFileSync(concatFilePath, concatContent);

  const finalVideoPath = path.join(BASE_DIR, "firstlook-demo-reel.mp4");
  console.log(`\nConcatenating all segments into ${finalVideoPath}...`);

  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFilePath}" -c copy "${finalVideoPath}" 2>/dev/null`);

  const finalDurStr = execSync(`ffprobe -i "${finalVideoPath}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
  const finalDuration = parseFloat(finalDurStr);
  const fileSize = fs.statSync(finalVideoPath).size;

  console.log("\n=======================================================");
  console.log(`🎥 DEMO REEL SUCCESSFULLY ASSEMBLED!`);
  console.log(`File: ${finalVideoPath}`);
  console.log(`Duration: ${finalDuration.toFixed(2)}s (${Math.floor(finalDuration / 60)}m ${(finalDuration % 60).toFixed(0)}s) [Hard Cap: ≤ 3:00 / 180s]`);
  console.log(`File Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("Assembly failed:", err);
  process.exit(1);
});
