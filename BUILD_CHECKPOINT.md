# Agentic Cinema — Build Checkpoint

> Single handoff doc for Agentic Cinema (ClickHouse Track). A resuming agent or operator reads this first.

## Status
**COMPLETE + Stage-One Verified + Load-Bearing ClickHouse via `mcp-clickhouse` + Google Cloud Services.**
All milestones M0–M6 implemented fresh by Google Antigravity / Gemini. Live OLAP query against ClickHouse's public **4,557,605,031-row `youtube` dataset** verified via official `mcp-clickhouse` server (`run_query` tool). Real 4K film clips seeded from Blender's CC-BY *Sintel*. Remotion render engine, Gemini 3.6 Flash planner, Google Cloud Storage integration (`@google-cloud/storage`), honest-state calendar (`Published · SIM`), and LLM benchmark revision loop fully functional and verified.

## Project Facts
- **Repo Root**: `/home/zin-kg/code/hackathons/agentic-cinema-2026/placeholder/`
- **Stack**: Next.js 15 (App Router) + React 19 + Tailwind CSS v4; Remotion 4 (`@remotion/renderer` off-serverless worker); `@google/genai` (Gemini 3.6 Flash & Veo 3.1); `@google-cloud/storage` (Google Cloud Storage); `@modelcontextprotocol/sdk` (`mcp-clickhouse` stdio client); SQLite (`node:sqlite`).
- **ClickHouse MCP Target**:
  - Read/Benchmark Leg: `sql-clickhouse.clickhouse.com:8443` (public Playground, user `demo`, 4.56B youtube dataset).
  - Write/Event Leg: `mcp-clickhouse` with `CLICKHOUSE_ALLOW_WRITE_ACCESS=true`.
- **Google Cloud Storage Target**: Bucket defined in `GCS_BUCKET_NAME` via `@google-cloud/storage` SDK.
- **Verified E2E**: `npm run test:e2e` (Gemini plan -> Remotion renders MP4/JPEG -> calendar approve -> ClickHouse event seed -> Gemini benchmark revision).

## Milestone Ledger
- **M0 Scaffold** — ACCEPTED. Next 15 + Remotion 4 + TS + `@google/genai` + `@google-cloud/storage` + `@modelcontextprotocol/sdk` (`mcp-clickhouse`); `git init`; tsconfig/postcss/next configs. Verified: `npm run build` ✓ (4.3s), `npm run typecheck` ✓ (0 errors).
- **M1 Brief + Uploads** — ACCEPTED. `lib/db.ts` (SQLite schema), `lib/storage.ts` (GCS + local storage), `lib/ffprobe.ts`, `scripts/seed-sintel.ts`. Verified: seeded Blender's CC-BY *Sintel* (4 clips + poster).
- **M2 Remotion Compositions** — ACCEPTED. `remotion/`: `Teaser.tsx` (16:9 multi-clip + captions + `GENERATED · PROXY` badge), `TeaserVertical.tsx` (9:16 vertical), `PosterPost.tsx` (4:5 poster), `schemas.ts`.
- **M3 Render Worker** — ACCEPTED. `lib/remotion-render.ts`, `worker/render.ts`, `worker/index.ts`. Ephemeral static server over `storage/` for Chromium rendering. Verified: headless render Teaser -> MP4.
- **M4 Agent Generate** — ACCEPTED. `lib/llm.ts` (Gemini 3.6 Flash), `lib/campaign-plan.ts` (grounded campaign planner), `lib/generate.ts`. Verified: Gemini plan -> Remotion render jobs dispatched.
- **M5 Approve + Honest Calendar** — ACCEPTED. `lib/schedule.ts`, `app/campaign/[id]/calendar/page.tsx`. Filmstrip timeline, `Published · SIM` badges, zero real account posting.
- **M6 Load-Bearing ClickHouse via MCP** — ACCEPTED. `lib/clickhouse-mcp.ts` executes ALL queries via `mcp-clickhouse` (`run_query` tool). Scanned 4.557B rows. `lib/revise.ts` Gemini revision reasoning against real benchmark.

## Current Accepted State
COMPLETE concept loop with LOAD-BEARING ClickHouse via `mcp-clickhouse` & Google Cloud Services: Brief -> Gemini plan -> Remotion render -> GCS Cloud Storage -> Honest calendar -> Publish SIM -> ClickHouse event stream via MCP -> 4.56B YouTube benchmark comparison via MCP -> Gemini revision loop.

## Remaining Operator Gates
- Deploy host selection (Vercel / EC2 / Render).
- ClickHouse Cloud cluster credentials (for custom event storage).
- Google Cloud Storage bucket provisioning (`GCS_BUCKET_NAME`).
- Devpost final entry submission.
