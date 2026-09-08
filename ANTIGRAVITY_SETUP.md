# Antigravity build setup — Agentic Cinema submission

> Setup/reference doc (not product code). This is the **Google-tools-only** submission workspace.
> Section 7.B (organizer, 2026-09-04): only Gemini CLI, Gemini Code Assist, or Antigravity (`agy`)
> may write code here — including scaffolding, tests, and deploy config. Do not use a non-Google
> coding assistant for any build step. `agy` v1.1.27 verified; authoritative customization spec at
> `~/.gemini/antigravity-cli/builtin/skills/agy-customizations/`.

## What's already scaffolded (this dir)

| File | Purpose |
|---|---|
| `AGENTS.md` | Always-on build rules (concept, Section 7.B, ClickHouse-via-MCP, honesty, deliverables). Antigravity reads it natively. |
| `GEMINI.md` | Antigravity-specific pointer → AGENTS.md + notes. |
| `HANDOFF.md` | **The kickoff prompt + phased build order** (port the reference architecture). Start here. |
| `.agents/skills/` | 34 hackathon method skills (design-direction, deploy, demo-director, submission-devpost, judge-panel, …) — invoke by name. |
| `.agents/plugins/clickhouse-mcp/` | Auto-loading plugin wiring the official `mcp-clickhouse` (defaults to the public SQL Playground). |

Discovery is anchored to the `.git` root, so **`git init` first** (also the public-repo deliverable):
```bash
cd ~/code/hackathons/agentic-cinema-2026/placeholder   # rename to the project name once chosen
git init
```

## ClickHouse MCP — the two targets

The track requires the app to use ClickHouse **at runtime via `mcp-clickhouse`**. Two connection targets:

1. **Benchmark (read, real 4.56B-row dataset)** — the `clickhouse-mcp` plugin already points at the
   **public SQL Playground** (`sql-clickhouse.clickhouse.com:8443`, user `demo`, no password). Works
   immediately — the agent can run the benchmark query against `youtube.youtube`. No account needed.

2. **The app's own events (write leg)** — your **ClickHouse Cloud** cluster ($400 credits). Add a
   second MCP server (machine-local, so credentials never enter the repo):
   ```bash
   agy mcp add --env CLICKHOUSE_HOST=<cloud-host> --env CLICKHOUSE_PORT=8443 \
     --env CLICKHOUSE_USER=default --env CLICKHOUSE_PASSWORD=<pw> \
     --env CLICKHOUSE_SECURE=true --env CLICKHOUSE_ALLOW_WRITE_ACCESS=true \
     clickhouse-cloud uvx mcp-clickhouse
   agy mcp list
   ```
   `CLICKHOUSE_ALLOW_WRITE_ACCESS=true` is what enables the demonstrated write leg the rubric rewards.
   (Machine-local MCP config lives at `~/.gemini/config/mcp_config.json` — do NOT commit credentials.)

## Permissions — global allowlist (the active setup)

Command permissions live **machine-local** in `~/.gemini/antigravity-cli/settings.json` under
`permissions.allow`. The format supports a bare binary (`command(npm)` = all npm) or a specific
subcommand (`command(git commit)`). **This is already configured** with the common build set:

- Bare-binary allows (all invocations): `npm npx node pnpm yarn tsc tsx next remotion uvx uv
  ffprobe ffmpeg` + shell/read helpers (`ls cat grep find head tail wc sed awk jq env mkdir cp mv touch`).
- Git allowed by **subcommand** — `init add commit status log diff branch checkout restore config
  remote fetch`. **`git push` is intentionally NOT allowed**, so an outward push still prompts.
- Not listed (so they still prompt): `curl wget docker rm ssh sudo` and any `git push`.

Applies to `agy` everywhere (not just this workspace). Edit the file to adjust, or manage interactively
with `/config`. **Changes take effect in a new `agy` session.** Nuclear option (sandbox only):
`agy --dangerously-skip-permissions` auto-approves everything.

The workspace is already trusted (`trustedWorkspaces` includes this dir), which the allowlist requires.

## Start the build

```bash
cd ~/code/hackathons/agentic-cinema-2026/placeholder
agy            # then paste the Kickoff prompt from HANDOFF.md
# or non-interactive: agy -p "$(sed -n '/Kickoff prompt/,/Read first/p' HANDOFF.md)"
```

## Notes

- `.claude/` and `.codex/` dirs here (if present) are inert for this Google-only event — don't invoke them.
- Skills alternative: instead of the 34-skill mirror, `.agents/skills.json` can `inherit` the suite's
  canonical `skills/` (see the agy-customizations `json_configs` doc) — but the local mirror is
  self-contained, which a submission repo wants.
- Human gates: ClickHouse Cloud account, Veo access, deploy/hosting, real-viewer recruitment, repo
  license, and final Devpost submission are all operator actions.
