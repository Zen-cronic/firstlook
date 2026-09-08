import puppeteer from "puppeteer";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const outputDir = path.resolve(process.cwd(), "submission/firstlook/visuals");
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("Launching headless browser to capture demo plates at 1920x1080...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080"],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const CAMPAIGN_ID = "4740aeee-dd5c-4f19-93a8-1388749b7ee4";

  // 1. Scene 1: Cockpit with Teaser & GENERATED · PROXY badge
  console.log("Capturing Scene 1: Cockpit Teaser with GENERATED · PROXY badge...");
  await page.goto(`http://localhost:3000/campaign/${CAMPAIGN_ID}`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outputDir, "scene_1_hook.png") });

  // 2. Scene 2: ClickHouse 4.56B YouTube Benchmark Tab
  console.log("Capturing Scene 2: ClickHouse 4.56B YouTube Benchmark Tab...");
  // Click on the benchmark tab
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes("4.56B YouTube Benchmark")) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outputDir, "scene_2_clickhouse.png") });

  // 3. Scene 3: Film Brief Page
  console.log("Capturing Scene 3: Brief Page with Sintel 4K clips and spoiler rules...");
  await page.goto(`http://localhost:3000/brief`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));
  // Pre-fill or view the form
  await page.evaluate(() => {
    const titleInput = document.querySelector('input[placeholder*="Sintel"]') as HTMLInputElement;
    if (titleInput) titleInput.value = "Sintel";
  });
  await page.screenshot({ path: path.join(outputDir, "scene_3_brief.png") });

  // 4. Scene 4: Multi-format outputs
  console.log("Capturing Scene 4: Multi-Format Deliverables (16:9, 9:16, 4:5)...");
  await page.goto(`http://localhost:3000/campaign/${CAMPAIGN_ID}`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outputDir, "scene_4_formats.png") });

  // 5. Scene 5: Honest Calendar with Published · SIM badges
  console.log("Capturing Scene 5: Honest Calendar with Published · SIM badges...");
  await page.goto(`http://localhost:3000/campaign/${CAMPAIGN_ID}/calendar`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outputDir, "scene_5_calendar.png") });

  // 6. Scene 6: ClickHouse Revision Loop
  console.log("Capturing Scene 6: ClickHouse Telemetry & Gemini Benchmark Revision...");
  await page.goto(`http://localhost:3000/campaign/${CAMPAIGN_ID}`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));
  const buttons2 = await page.$$("button");
  for (const b of buttons2) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes("4.56B YouTube Benchmark")) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
  // Scroll slightly down to focus on stats and revision section
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.screenshot({ path: path.join(outputDir, "scene_6_revision.png") });

  // 7. Scene 7: High-Level Architecture Diagram
  console.log("Capturing Scene 7: High-Level Architecture Diagram...");
  await page.goto(`http://localhost:3000/architecture`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outputDir, "scene_7_architecture.png") });

  // 8. Scene 8: Closing End Card
  console.log("Capturing Scene 8: Closing End Card...");
  // Create an end card HTML or capture
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          margin: 0;
          background: #000;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
        }
        .container {
          text-align: center;
          max-width: 1000px;
        }
        .badge {
          display: inline-block;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 14px;
          font-family: monospace;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 64px;
          font-weight: 900;
          letter-spacing: -2px;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 22px;
          color: #a3a3a3;
          margin: 0 0 40px 0;
          line-height: 1.5;
        }
        .tags {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 48px;
        }
        .tag {
          background: #171717;
          border: 1px solid #262626;
          padding: 8px 18px;
          border-radius: 12px;
          font-family: monospace;
          font-size: 14px;
          color: #d4d4d4;
        }
        .repo {
          font-family: monospace;
          font-size: 18px;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 12px 28px;
          border-radius: 12px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">Agentic Cinema Hackathon 2026 · ClickHouse Track</div>
        <h1>FirstLook</h1>
        <p>A film-marketing agent that tests its campaign against real releases before you spend a single dollar.</p>
        <div class="tags">
          <div class="tag">ClickHouse MCP (4.56B Scan)</div>
          <div class="tag">Gemini 3.6 Flash</div>
          <div class="tag">Remotion 4 Engine</div>
          <div class="tag">Google Cloud Storage</div>
        </div>
        <div class="repo">github.com/Zen-cronic/firstlook</div>
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: path.join(outputDir, "scene_8_closing.png") });

  await browser.close();
  console.log("All visual scenes captured successfully in:", outputDir);
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
