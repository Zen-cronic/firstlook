import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function main() {
  const videoPath = path.resolve(process.cwd(), "submission/firstlook/firstlook-demo-reel.mp4");
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  console.log("=== FirstLook Gemini Video Understanding & Critique ===");
  const buffer = fs.readFileSync(videoPath);
  const blob = new Blob([buffer], { type: "video/mp4" });
  console.log(`Video file size: ${(blob.size / (1024 * 1024)).toFixed(2)} MB`);

  console.log("Uploading demo reel to Gemini File API...");
  const uploadResult = await ai.files.upload({
    file: blob,
    mimeType: "video/mp4",
    config: { mimeType: "video/mp4" },
  });

  console.log(`Uploaded: ${uploadResult.name}. Waiting for video processing...`);
  let file = uploadResult;
  let attempts = 0;
  while (file.state === "PROCESSING") {
    attempts++;
    console.log(`Processing video (attempt ${attempts})...`);
    await new Promise((r) => setTimeout(r, 4000));
    file = await ai.files.get({ name: file.name });
  }

  if (file.state !== "ACTIVE") {
    throw new Error(`Video processing failed with state: ${file.state}`);
  }

  console.log("Video processing complete! Calling Gemini for deep multimodal critique...");

  const evaluationPrompt = `
You are a senior hackathon judge evaluating this video submission for the Agentic Cinema Hackathon (ClickHouse Track).
Analyze the attached demo video ("FirstLook — Autonomous Film-Marketing Agent") thoroughly across visual, audio, pacing, and technical dimensions.

Specifically evaluate and critique based on these core requirements:

1. JUDGE LEGIBILITY (Non-Vertical Tech Judge Comprehension):
- Is the problem statement (filmmakers guessing which trailer cut to release) clear to a software engineer or general tech judge with no film/media industry background?
- Is the narrative flow easy to follow from problem -> solution -> live proof -> results?
- Is the voiceover clear, articulate, and well-paced?

2. LOAD-BEARING SPONSOR HERO-TECH (ClickHouse via mcp-clickhouse):
- How prominently is ClickHouse featured on screen and in narration?
- Does it clearly showcase the 4,557,605,031 real YouTube trailer rows scanned?
- Is the official Model Context Protocol (mcp-clickhouse / uvx mcp-clickhouse) stdio tool transport explicitly demonstrated and explained?
- Does it articulate why ClickHouse OLAP is essential (counterfactual: Postgres/SQLite crashing or timing out on billions of rows)?

3. HIGH-LEVEL SYSTEM ARCHITECTURE:
- Is the architecture diagram visually displayed on screen?
- Are the core architectural components clearly explained (Next.js 15 UI, Gemini 3.6 Flash multimodal orchestrator, Remotion 4 programmatic video engine, Google Cloud Storage gs://agentic-cinema-2026-media, and ClickHouse Cloud OLAP via mcp-clickhouse)?
- Does a tech judge understand how data flows through the entire system?

4. DESIGN HONESTY & TRANSPARENCY:
- Are the honesty badges (GENERATED · PROXY on AI inserts, and Published · SIM on scheduled calendar items) visible and highlighted?
- Does the demo honestly state that publishing is simulated to prevent rogue live posts?

5. TIMING & PRODUCTION VALUE:
- Verify duration (Hard cap: <= 3:00 / 180s).
- Evaluate video resolution (1080p), lower-third readability, and audio mix.

Provide your response in structured GitHub Flavored Markdown with:
- Executive Summary & Verdict
- Rubric Scoring Breakdown (Tech Implementation /30, Design & Honesty /25, Potential Impact /25, Quality of the Idea /20 -> Total /100)
- Beat-by-Beat Timestamp Analysis
- Strengths & Key Highlights
- Actionable Recommendations for Live Devpost Judging
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { fileUri: file.uri, mimeType: "video/mp4" } },
          { text: evaluationPrompt },
        ],
      },
    ],
  });

  const critiqueText = response.text;
  console.log("\n=== Gemini Video Understanding Critique Received! ===\n");
  console.log(critiqueText);

  const critiquePath = path.resolve(process.cwd(), "submission/firstlook/video-understanding-critique.md");
  fs.writeFileSync(critiquePath, critiqueText || "");
  console.log(`\nCritique saved to: ${critiquePath}`);
}

main().catch((err) => {
  console.error("Video analysis failed:", err);
  process.exit(1);
});
