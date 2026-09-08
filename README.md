# Agentic Cinema — Film Marketing Engine (ClickHouse Track)

**Agentic Cinema** is a film-marketing agent that tests marketing campaign performance against real theatrical and streaming releases **before you spend a single dollar on ad campaigns**.

Brief a film + release date → Gemini 3.6 Flash plans a campaign grounded strictly in the film's real assets → render a 16:9 teaser trailer, 9:16 vertical video, and 4:5 poster via Remotion with visual `GENERATED · PROXY` honesty labels → approve -> honest-state campaign calendar (`Published · SIM`) → **the load-bearing move: compare campaign engagement against real comparable releases using ClickHouse's public 4.56-billion-row `youtube` dataset via the official `mcp-clickhouse` MCP server**, and trigger an LLM revision loop reasoning against that real benchmark.

---

## 🏛️ ClickHouse Runtime Architecture & Track Compliance

This application **actively uses ClickHouse at runtime via the official `mcp-clickhouse` MCP server** (`run_query` tool calls), strictly complying with Stage-One rules and Section 7.B.

```
+--------------------------+       MCP stdio transport        +--------------------------------+
|  Next.js / Node Backend  |  =============================>  |  mcp-clickhouse (run_query)    |
| (Agentic Cinema Engine)  |  <=============================  |  (Official ClickHouse Server)  |
+--------------------------+                                  +--------------------------------+
                                                                             ||
                                                                    +------------------+
                                                                    | ClickHouse OLAP  |
                                                                    | 4.56B youtube    |
                                                                    +------------------+
```

### ClickHouse Necessity Table

| Feature | Where Used in Code | Why ClickHouse is Essential (Substitutability Analysis) |
|---|---|---|
| **Real Comparable Release Benchmark** | [`lib/clickhouse-mcp.ts:98`](file:///home/zin-kg/code/hackathons/agentic-cinema-2026/placeholder/lib/clickhouse-mcp.ts#L98-L113) | Performs an instant OLAP aggregation scan over **4,557,605,031 rows** in the public `youtube.youtube` table (`WHERE positionCaseInsensitive(title, 'official trailer') > 0`) to compute true median and p90 engagement rates across 44,000+ movie trailers. **PostgreSQL/SQLite cannot perform a sub-second scan over 4.5B rows without crashing or timing out.** |
| **High-Volume Event Stream Ingestion** | [`lib/clickhouse-mcp.ts:135`](file:///home/zin-kg/code/hackathons/agentic-cinema-2026/placeholder/lib/clickhouse-mcp.ts#L135-L188) | Ingests thousands of impression, click, complete, and like events per campaign item into a `MergeTree` table (`campaign_events`) via `mcp-clickhouse` with `CLICKHOUSE_ALLOW_WRITE_ACCESS=true`. Handles real-time event analytics at scale. |
| **Data-Grounded LLM Revision Loop** | [`lib/revise.ts:38`](file:///home/zin-kg/code/hackathons/agentic-cinema-2026/placeholder/lib/revise.ts#L38-L82) | Feeds real ClickHouse median/p90 trailer benchmark data into Gemini 3.6 Flash so the LLM can adversarially reason against real market performance and rewrite underperforming post captions. |

---

## 🛠️ Stack & Technology

- **AI Engine**: Gemini 3.6 Flash (`@google/genai`) + Veo 3.1 proxy generator
- **OLAP Engine**: ClickHouse via `mcp-clickhouse` (`@modelcontextprotocol/sdk`)
- **Render Engine**: Remotion 4 (`@remotion/renderer`)
- **Frontend / Framework**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide Icons
- **App State**: SQLite (`node:sqlite`) + `ffprobe`/`ffmpeg`

---

## 🚀 Quickstart & Verification

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env.local)
cp .env.example .env.local

# 3. Seed real 4K Blender CC-BY film assets ("Sintel")
npm run seed:sintel

# 4. Verify mcp-clickhouse 4.56B-row query
npm run test:ch-mcp

# 5. Verify Remotion headless render engine
npm run test:render

# 6. Start development server & background render worker
npm run dev
npm run worker
```

---

## 🛡️ Honesty & Compliance Model

- **Real Footage Basis**: Real video clips are the teaser basis.
- **Visual Honesty Badges**: Every generated/proxy clip is visually stamped with `GENERATED · PROXY`.
- **Simulated Publishing**: Campaign states are explicit (`Draft` -> `Scheduled` -> `Published · SIM`). Zero real social media accounts are posted to.
- **Real Benchmark vs Synthetic Audience**: Benchmark data is pulled from 4.56B real YouTube rows; demo campaign impression rows carry `synthetic = 1`.
- **Section 7.B**: Built using Google Antigravity & Gemini CLI.
