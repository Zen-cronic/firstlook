import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY in environment");
  process.exit(1);
}

// Voice: George - Warm, Captivating Storyteller
const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

const BEATS = [
  {
    id: "beat_1_hook",
    title: "Beat 1: Hook & Core Problem",
    text: "Indie filmmakers finish a film with raw footage and a poster, but zero marketing capacity. Traditional AI tools vomit random clips, but they cannot tell you if any cut will actually perform. Meet FirstLook: an autonomous film-marketing agent testing your campaign against real releases before you spend a single dollar. Notice this teaser cut from Sintel: every AI proxy shot is visibly labeled GENERATED PROXY, preserving complete honesty.",
  },
  {
    id: "beat_2_clickhouse_mcp",
    title: "Beat 2: ClickHouse 4.56B Row MCP Scan",
    text: "Here is our load-bearing core: the ClickHouse Benchmark. FirstLook connects directly to ClickHouse Cloud via the official Model Context Protocol server: uvx mcp-clickhouse. In a single sub-second query, it scans four billion, five hundred fifty-seven million, six hundred five thousand, thirty-one real YouTube video rows. Across 44,000 real theatrical trailers, it calculates median engagement and a top 90th percentile of 2.91%. PostgreSQL would crash or take hours; ClickHouse aggregates 4.56 billion rows in milliseconds.",
  },
  {
    id: "beat_3_brief",
    title: "Beat 3: Grounded Briefing & Multimodal Planning",
    text: "In the briefing room, the filmmaker inputs the logline, release date, and strict spoiler constraints, then uploads their raw 4K footage. Gemini 3.6 Flash analyzes scene composition and tempo to draft an entire multi-platform campaign grounded strictly in authentic footage, without leaking third-act plot twists.",
  },
  {
    id: "beat_4_remotion",
    title: "Beat 4: Remotion Programmatic Rendering",
    text: "FirstLook triggers our headless Remotion engine. Remotion cuts the raw footage, applies kinetic typography, and renders three deliverables simultaneously: a 16:9 theatrical teaser, a 9:16 vertical cut for TikTok and Reels, and a 4:5 social poster, paired with platform-tailored copy.",
  },
  {
    id: "beat_5_calendar",
    title: "Beat 5: Honest Campaign Calendar & Simulation",
    text: "The filmmaker reviews the rollout calendar leading up to premiere night. When approved, FirstLook simulates the launch. Look closely at the badge: Published SIM. FirstLook adheres strictly to ethical honesty: synthetic assets are labeled, and no automated agent ever pushes unapproved content to live accounts.",
  },
  {
    id: "beat_6_revision",
    title: "Beat 6: ClickHouse Telemetry & Gemini Revision",
    text: "Simulated audience impressions stream into ClickHouse MergeTree tables. When an asset underperforms the 4.56-billion trailer benchmark, FirstLook's autonomous revision loop kicks in: Gemini inspects the telemetry and drafts an optimized copy revision against real data.",
  },
  {
    id: "beat_7_architecture",
    title: "Beat 7: High-Level Architecture Walkthrough",
    text: "Here is our high-level architecture. Next.js 15 powers the Cockpit and Honest Calendar. Gemini 3.6 Flash serves as the orchestrator. Remotion and headless Chromium synthesize video to Google Cloud Storage. At the analytical center, all ClickHouse reads and writes execute via the official mcp-clickhouse stdio transport across 4.56 billion rows.",
  },
  {
    id: "beat_8_closing",
    title: "Beat 8: Wrap-Up & Open Source",
    text: "FirstLook turns marketing guesswork into an empirical science: test before you spend. Built with ClickHouse, Gemini, Remotion, and Google Cloud. Open-source on GitHub at Zen-cronic slash firstlook.",
  },
];

async function generateBeat(beat: typeof BEATS[0], outputDir: string) {
  const filePath = path.join(outputDir, `${beat.id}.mp3`);
  console.log(`Synthesizing ${beat.title}...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: beat.text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to synthesize ${beat.id}: ${res.status} ${errorText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  const durStr = execSync(`ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
  const duration = parseFloat(durStr);
  console.log(`Saved ${filePath} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB, duration: ${duration.toFixed(2)}s)`);

  return { ...beat, filePath, duration };
}

async function main() {
  const outputDir = path.resolve(process.cwd(), "submission/firstlook/audio");
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("=== Generating Demo Voiceover via ElevenLabs API ===");
  const results = [];
  let totalDuration = 0;

  for (const beat of BEATS) {
    const res = await generateBeat(beat, outputDir);
    results.push(res);
    totalDuration += res.duration;
  }

  console.log("\n=== Voiceover Synthesis Summary ===");
  console.log(`Total Beats: ${results.length}`);
  console.log(`Total Voiceover Duration: ${totalDuration.toFixed(2)} seconds (${Math.floor(totalDuration / 60)}m ${(totalDuration % 60).toFixed(0)}s)`);

  fs.writeFileSync(
    path.join(outputDir, "manifest.json"),
    JSON.stringify({ totalDuration, beats: results }, null, 2)
  );
  console.log(`Manifest written to ${path.join(outputDir, "manifest.json")}`);
}

main().catch((err) => {
  console.error("Error generating voiceovers:", err);
  process.exit(1);
});
