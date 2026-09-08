# Google Antigravity entry point

Canonical build rules live in **[AGENTS.md](./AGENTS.md)** — read it in full first. Antigravity
reads `AGENTS.md` natively; this file is the Antigravity-specific pointer + notes. Nothing here
overrides AGENTS.md.

- **The task / build order:** [HANDOFF.md](./HANDOFF.md).
- **Skills:** `.agents/skills/<name>/SKILL.md` — the hackathon method skills (design-direction,
  deploy, demo-director, submission-devpost, judge-panel, etc.). Invoke by name.
- **ClickHouse MCP:** the `clickhouse-mcp` plugin under `.agents/plugins/` wires the official
  `mcp-clickhouse` and auto-loads. It points at ClickHouse's **public SQL Playground** by default
  (read-only, the real 4.56B-row `youtube` dataset — for the benchmark). For the app's OWN events
  (the write leg), point a second config at your ClickHouse Cloud cluster — see `ANTIGRAVITY_SETUP.md`.
- **Reference implementation:** `../reelkit/` — read it as a design spec; write fresh code here
  (Section 7.B: the submission's code must be Antigravity/Gemini-authored, not copied from the
  Claude-built reference).
