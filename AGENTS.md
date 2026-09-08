# Agentic Cinema submission — build rules (Antigravity/Gemini)

You are **Google Antigravity / Gemini**, the permitted build tool for this Agentic Cinema
(Devpost, **ClickHouse track**) submission. You write the code here; that is compliant.

## Hard compliance (disqualifier-level)

- **Section 7.B:** only Gemini CLI, Gemini Code Assist, or Antigravity may provide coding
  assistance — you are it. Never paste output from a non-Google coding assistant into this repo.
- **ClickHouse track requirement:** the app must **actively use ClickHouse at runtime via the
  official `mcp-clickhouse` MCP server** (connected to ClickHouse Cloud or a self-hosted cluster).
  Route ALL runtime ClickHouse reads/writes through `mcp-clickhouse` (a `run_query` tool call) —
  NOT a direct database client. The reference uses the direct client; that would FAIL Stage One
  here. The `clickhouse-mcp` plugin under `.agents/plugins/` wires it for you.
- **New-work rule:** all code begins on/after 2026-07-27. One track, at most one prize.
- Account creation, terms, public-repo settings, media rights, real-viewer recruitment, deploy,
  and final submission remain human (operator) gates.

## The product (concept — judge-hardened)

A film-marketing agent that **tests the campaign against real releases before you spend**:
brief a film + release date → Gemini plans a campaign grounded only in the film's real assets →
render a teaser (real footage + optional labeled Veo proxy) + a 9:16 vertical + a poster →
approve → an honest-state campaign calendar (publishing is **simulated**) → **the load-bearing
move: compare every asset against real comparable releases using ClickHouse's public 4.56B-row
`youtube` dataset ("this cut beats the p90 for real trailers")** → an LLM revision loop that
reasons against that real benchmark. Optional synthesis (higher ceiling): add a real, owned
preview-page A/B of two cuts with consenting viewers, events landing in ClickHouse via the MCP.

Why ClickHouse is necessary (put this in the README necessity table): the core claim needs a
billion-row scan in seconds — non-substitutable OLAP that Postgres cannot do.

## Honesty (non-negotiable, on screen)

Real footage is the teaser basis; every generated/Veo asset is labeled `GENERATED · PROXY`.
Distinct delivery states (draft / scheduled / **Published · SIM**) — nothing posts to a real
account. Synthetic engagement rows carry `synthetic = 1` and are labeled; **the benchmark is
real, the demo audience is simulated**; never claim causal uplift.

## Deliverables

Working Google-powered agent + ClickHouse-via-MCP; hosted judge-reachable URL; public OSS repo
with an OSI license; English/subtitled demo video (≤3 min, YouTube/Vimeo). Stack: Gemini 3.6
Flash (planner) + Veo 3.1 (labeled proxy) + Remotion (render) + ClickHouse (via `mcp-clickhouse`).

## Context (authoritative — read first)

In `../../` (the suite hackathon dir `~/code/hackathons/hackathon-agent/hackathons/agentic-cinema-2026/`):
`state.md`; `research/devpost-recon-2026-09-07.md` (rules/rubric/deadline T-2 2026-09-09 17:00 EDT),
`research/judge-panel-2026-09-07.md` (what wins/loses), `research/synthesis-branchcut-marketing-2026-09-07.md`
(the sharpened concept), `research/demo-run-of-show-2026-09-07.md`, and `submission/devpost-draft-handoff.md`.
