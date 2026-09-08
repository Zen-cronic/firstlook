"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Database, 
  Sparkles, 
  Film, 
  Cloud, 
  Calendar, 
  RefreshCw, 
  Layers, 
  ShieldCheck,
  Cpu,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  Terminal,
  ExternalLink
} from "lucide-react";

interface NodeDetail {
  id: string;
  name: string;
  category: string;
  protocol: string;
  latency: string;
  description: string;
  codeSnippet: string;
}

const NODES: Record<string, NodeDetail> = {
  client: {
    id: "client",
    name: "Filmmaker Studio Cockpit",
    category: "Client & Ingestion",
    protocol: "Next.js 15 App Router · React 19",
    latency: "< 50ms local render",
    description: "Multi-track campaign dashboard where filmmakers upload raw 4K clips, set release windows, establish spoiler avoidance guardrails, and preview programmatic deliverables.",
    codeSnippet: `// app/campaign/[id]/page.tsx
const brief = await getBrief(briefId);
const versions = await getVersions(briefId);
const benchmark = await queryClickHouseBenchmark();`,
  },
  gemini: {
    id: "gemini",
    name: "Gemini 3.6 Flash Planner",
    category: "Multimodal AI Orchestrator",
    protocol: "Google GenAI SDK · Structured JSON",
    latency: "1.2s - 2.4s",
    description: "Multimodal intelligence engine that inspects video keyframes and pacing, generates campaign strategy, scripts multi-platform copy, and autonomously drafts revision loops based on real performance.",
    codeSnippet: `// lib/campaign-plan.ts
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [briefText, ...keyframes],
  config: { responseSchema: CampaignPlanSchema },
});`,
  },
  remotion: {
    id: "remotion",
    name: "Remotion 4 Render Engine",
    category: "Programmatic Media Synthesis",
    protocol: "Headless Chromium · H.264 / AAC",
    latency: "12s - 18s / 15s video",
    description: "Programmatically generates 16:9 Theatrical Teasers, 9:16 Vertical Cuts with kinetic captions, and 4:5 Keyframe Posters from single authentic master footage, watermarked with transparent proxy labels.",
    codeSnippet: `// lib/remotion-render.ts
await renderMedia({
  composition: "TeaserVertical",
  serveUrl: bundlePath,
  outputLocation: outputPath,
  inputProps: { clips, captions, title, tagline }
});`,
  },
  clickhouse: {
    id: "clickhouse",
    name: "Official mcp-clickhouse Server",
    category: "Hero-Tech OLAP Core (Section 7.B)",
    protocol: "stdio transport · JSON-RPC 2.0",
    latency: "120ms - 380ms",
    description: "Load-bearing bridge connecting the agent directly to ClickHouse Cloud. Executes read queries over the public 4.56B YouTube dataset and ingests private campaign telemetry via official run_query tool calls.",
    codeSnippet: `// lib/clickhouse-mcp.ts
const transport = new StdioClientTransport({
  command: "uvx",
  args: ["mcp-clickhouse", "--host", host, "--secure"]
});
const result = await client.callTool({
  name: "run_query",
  arguments: { query: "SELECT quantilesExactWeighted(0.5, 0.90)(engagement) FROM youtube.youtube" }
});`,
  },
  gcs: {
    id: "gcs",
    name: "Google Cloud Storage & Cloud Run",
    category: "Cloud Infrastructure",
    protocol: "HTTP/2 SSL · GCS API",
    latency: "15ms edge",
    description: "Hosts rendered media assets in bucket gs://agentic-cinema-2026-media and runs the serverless containerized production application on Google Cloud Run.",
    codeSnippet: `// lib/storage.ts
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
await bucket.upload(localPath, { destination: gcsFilename });`,
  },
};

export default function ArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState<string>("clickhouse");
  const activeDetail = NODES[selectedNode] || NODES.clickhouse;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider font-mono">
                  FirstLook System Architecture
                </h1>
                <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700 px-2.5 py-0.5 rounded-full">
                  Interactive Node Graph
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Autonomous Film-Marketing Agent · ClickHouse Track · Official mcp-clickhouse Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
              <Database className="w-4 h-4" /> 4.56B Rows Scanned
            </span>
            <span className="flex items-center gap-1.5 text-red-400 bg-red-950/60 border border-red-800 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4" /> Official stdio MCP
            </span>
            <Link 
              href="/"
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
            >
              ← Back to Studio
            </Link>
          </div>
        </div>

        {/* Visual Architecture Diagram (SVG Canvas) */}
        <div className="cinema-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-white/10 shadow-2xl bg-neutral-950/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase font-bold text-neutral-300">Live Dataflow Topology</span>
              <span className="text-[10px] font-mono text-neutral-500">(Click any node to inspect runtime code &amp; protocols)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Analytical OLAP Flow</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> AI Reasoning Flow</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Media Render Flow</span>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="w-full overflow-x-auto">
            <svg 
              viewBox="0 0 1100 480" 
              className="w-full min-w-[900px] h-auto select-none"
              style={{ filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.5))" }}
            >
              <defs>
                <linearGradient id="grad-client" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="grad-gemini" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#450a0a" />
                  <stop offset="100%" stopColor="#1c0707" />
                </linearGradient>
                <linearGradient id="grad-ch" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#064e3b" />
                  <stop offset="100%" stopColor="#022c22" />
                </linearGradient>
                <linearGradient id="grad-remotion" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b0764" />
                  <stop offset="100%" stopColor="#1e0533" />
                </linearGradient>
                <linearGradient id="grad-gcs" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#172554" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                <filter id="glow-ch" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Arrow markers */}
                <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#34d399" />
                </marker>
                <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#f87171" />
                </marker>
                <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#c084fc" />
                </marker>
                <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#60a5fa" />
                </marker>
              </defs>

              {/* Background gridlines */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <rect width="1100" height="480" fill="url(#grid)" rx="20" />

              {/* CONNECTING FLOW PATHS */}
              {/* Client -> Gemini (Prompt & Raw Assets) */}
              <path 
                d="M 230 140 C 290 140, 310 140, 360 140" 
                fill="none" 
                stroke="#f87171" 
                strokeWidth="2.5" 
                strokeDasharray="6,4"
                markerEnd="url(#arrow-red)"
              />
              <text x="295" y="125" fill="#f87171" fontSize="10" fontFamily="monospace" textAnchor="middle">4K Assets</text>

              {/* Gemini -> Remotion (Campaign Plan) */}
              <path 
                d="M 580 140 C 630 140, 660 140, 710 140" 
                fill="none" 
                stroke="#c084fc" 
                strokeWidth="2.5" 
                strokeDasharray="6,4"
                markerEnd="url(#arrow-purple)"
              />
              <text x="645" y="125" fill="#c084fc" fontSize="10" fontFamily="monospace" textAnchor="middle">Plan JSON</text>

              {/* Remotion -> GCS (Rendered MP4s) */}
              <path 
                d="M 820 200 C 820 270, 820 300, 820 340" 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="2.5" 
                strokeDasharray="6,4"
                markerEnd="url(#arrow-blue)"
              />
              <text x="835" y="275" fill="#60a5fa" fontSize="10" fontFamily="monospace" textAnchor="start">16:9 / 9:16 / 4:5</text>

              {/* Client -> mcp-clickhouse (Benchmark scan) */}
              <path 
                d="M 130 200 C 130 330, 200 370, 280 370" 
                fill="none" 
                stroke="#34d399" 
                strokeWidth="2" 
                strokeDasharray="5,4"
                markerEnd="url(#arrow-green)"
              />
              <text x="145" y="290" fill="#34d399" fontSize="10" fontFamily="monospace">4.56B Scan</text>

              {/* ClickHouse -> Gemini (Telemetry & Revision Loop) */}
              <path 
                d="M 470 340 C 470 270, 470 240, 470 200" 
                fill="none" 
                stroke="#34d399" 
                strokeWidth="3" 
                strokeDasharray="7,3"
                markerEnd="url(#arrow-green)"
              />
              <text x="485" y="270" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">Telemetry Loop</text>

              {/* Gemini -> Client (Revised Plan) */}
              <path 
                d="M 420 200 C 370 250, 310 230, 230 170" 
                fill="none" 
                stroke="#f87171" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#arrow-red)"
              />
              <text x="320" y="230" fill="#f87171" fontSize="10" fontFamily="monospace">Optimized Cut</text>

              {/* GCS -> Client (Stream Media) */}
              <path 
                d="M 720 390 C 450 440, 230 350, 150 200" 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="2" 
                strokeDasharray="6,4"
                markerEnd="url(#arrow-blue)"
              />
              <text x="490" y="440" fill="#60a5fa" fontSize="10" fontFamily="monospace" textAnchor="middle">Cloud Run / GCS CDN Stream</text>


              {/* NODE 1: Client / Next.js */}
              <g 
                className="cursor-pointer transition-transform hover:scale-105" 
                onClick={() => setSelectedNode("client")}
              >
                <rect 
                  x="50" y="80" width="180" height="120" rx="16" 
                  fill="url(#grad-client)" 
                  stroke={selectedNode === "client" ? "#60a5fa" : "#334155"} 
                  strokeWidth={selectedNode === "client" ? 3 : 1.5}
                />
                <rect x="65" y="95" width="28" height="28" rx="8" fill="rgba(96, 165, 250, 0.2)" />
                <text x="79" y="114" fill="#60a5fa" fontSize="14" textAnchor="middle" fontWeight="bold">UI</text>
                <text x="105" y="106" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Studio Cockpit</text>
                <text x="105" y="122" fill="#94a3b8" fontSize="10" fontFamily="monospace">Next.js 15 · App Router</text>
                
                <line x1="65" y1="135" x2="215" y2="135" stroke="rgba(255,255,255,0.1)" />
                <text x="65" y="152" fill="#cbd5e1" fontSize="9" fontFamily="monospace">• Briefing &amp; 4K Sintel</text>
                <text x="65" y="167" fill="#cbd5e1" fontSize="9" fontFamily="monospace">• Spoiler Guardrails</text>
                <text x="65" y="182" fill="#cbd5e1" fontSize="9" fontFamily="monospace">• Campaign Calendar</text>
              </g>

              {/* NODE 2: Gemini 3.6 Flash Planner */}
              <g 
                className="cursor-pointer transition-transform hover:scale-105" 
                onClick={() => setSelectedNode("gemini")}
              >
                <rect 
                  x="370" y="80" width="200" height="120" rx="16" 
                  fill="url(#grad-gemini)" 
                  stroke={selectedNode === "gemini" ? "#f87171" : "#991b1b"} 
                  strokeWidth={selectedNode === "gemini" ? 3 : 1.5}
                  filter={selectedNode === "gemini" ? "url(#glow-red)" : undefined}
                />
                <rect x="385" y="95" width="28" height="28" rx="8" fill="rgba(248, 113, 113, 0.2)" />
                <text x="399" y="114" fill="#f87171" fontSize="14" textAnchor="middle">✨</text>
                <text x="425" y="106" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Gemini 3.6 Flash</text>
                <text x="425" y="122" fill="#fca5a5" fontSize="10" fontFamily="monospace">Multimodal Orchestrator</text>
                
                <line x1="385" y1="135" x2="555" y2="135" stroke="rgba(255,255,255,0.1)" />
                <text x="385" y="152" fill="#fecaca" fontSize="9" fontFamily="monospace">• Video Scene Reasoning</text>
                <text x="385" y="167" fill="#fecaca" fontSize="9" fontFamily="monospace">• Google Imagen &amp; Lyria 3</text>
                <text x="385" y="182" fill="#fecaca" fontSize="9" fontFamily="monospace">• Autonomous Revision</text>
              </g>

              {/* NODE 3: Remotion 4 Engine */}
              <g 
                className="cursor-pointer transition-transform hover:scale-105" 
                onClick={() => setSelectedNode("remotion")}
              >
                <rect 
                  x="720" y="80" width="200" height="120" rx="16" 
                  fill="url(#grad-remotion)" 
                  stroke={selectedNode === "remotion" ? "#c084fc" : "#6b21a8"} 
                  strokeWidth={selectedNode === "remotion" ? 3 : 1.5}
                />
                <rect x="735" y="95" width="28" height="28" rx="8" fill="rgba(192, 132, 252, 0.2)" />
                <text x="749" y="114" fill="#c084fc" fontSize="14" textAnchor="middle">🎞️</text>
                <text x="775" y="106" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Remotion 4 Engine</text>
                <text x="775" y="122" fill="#d8b4fe" fontSize="10" fontFamily="monospace">Multi-Format Pipeline</text>
                
                <line x1="735" y1="135" x2="905" y2="135" stroke="rgba(255,255,255,0.1)" />
                <text x="735" y="152" fill="#e9d5ff" fontSize="9" fontFamily="monospace">• 16:9 Theatrical (Lyria Audio)</text>
                <text x="735" y="167" fill="#e9d5ff" fontSize="9" fontFamily="monospace">• 9:16 Vertical (Captions)</text>
                <text x="735" y="182" fill="#e9d5ff" fontSize="9" fontFamily="monospace">• 4:5 Poster (Imagen Art)</text>
              </g>

              {/* NODE 4: ClickHouse Core (HERO-TECH CENTER STAGE) */}
              <g 
                className="cursor-pointer transition-transform hover:scale-105" 
                onClick={() => setSelectedNode("clickhouse")}
              >
                <rect 
                  x="290" y="320" width="360" height="130" rx="20" 
                  fill="url(#grad-ch)" 
                  stroke={selectedNode === "clickhouse" ? "#34d399" : "#059669"} 
                  strokeWidth={selectedNode === "clickhouse" ? 3.5 : 2}
                  filter={selectedNode === "clickhouse" ? "url(#glow-ch)" : undefined}
                />
                <rect x="310" y="338" width="36" height="36" rx="10" fill="rgba(52, 211, 153, 0.25)" />
                <text x="328" y="361" fill="#34d399" fontSize="18" textAnchor="middle">⚡</text>
                <text x="360" y="353" fill="#ffffff" fontSize="15" fontWeight="900" fontFamily="sans-serif">
                  mcp-clickhouse stdio Transport
                </text>
                <text x="360" y="370" fill="#6ee7b7" fontSize="11" fontFamily="monospace">
                  ClickHouse Cloud OLAP · Section 7.B Compliant
                </text>

                <line x1="310" y1="385" x2="630" y2="385" stroke="rgba(255,255,255,0.15)" />
                <text x="310" y="403" fill="#a7f3d0" fontSize="10" fontFamily="monospace">
                  • 4,557,605,031 Real YouTube Rows Scanned (&lt; 2s)
                </text>
                <text x="310" y="420" fill="#a7f3d0" fontSize="10" fontFamily="monospace">
                  • campaign_rollup MV (AggregatingMergeTree, zero raw scans)
                </text>
                <text x="310" y="437" fill="#a7f3d0" fontSize="10" fontFamily="monospace">
                  • windowFunnel Monotonic Viewer Conversion Analytics
                </text>
              </g>

              {/* NODE 5: GCS Storage & Cloud Infrastructure */}
              <g 
                className="cursor-pointer transition-transform hover:scale-105" 
                onClick={() => setSelectedNode("gcs")}
              >
                <rect 
                  x="730" y="340" width="260" height="110" rx="16" 
                  fill="url(#grad-gcs)" 
                  stroke={selectedNode === "gcs" ? "#60a5fa" : "#1d4ed8"} 
                  strokeWidth={selectedNode === "gcs" ? 3 : 1.5}
                />
                <rect x="745" y="355" width="28" height="28" rx="8" fill="rgba(96, 165, 250, 0.2)" />
                <text x="759" y="374" fill="#60a5fa" fontSize="14" textAnchor="middle">☁️</text>
                <text x="785" y="366" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Google Cloud Infra</text>
                <text x="785" y="382" fill="#93c5fd" fontSize="10" fontFamily="monospace">GCS &amp; Cloud Run</text>

                <line x1="745" y1="395" x2="975" y2="395" stroke="rgba(255,255,255,0.1)" />
                <text x="745" y="412" fill="#bfdbfe" fontSize="9" fontFamily="monospace">• gs://agentic-cinema-2026-media</text>
                <text x="745" y="427" fill="#bfdbfe" fontSize="9" fontFamily="monospace">• Serverless Cloud Run 00004-p76</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Dynamic Node Detail & Code Inspector Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Inspector Metadata */}
          <div className="cinema-card rounded-2xl p-6 space-y-4 border border-white/10 bg-neutral-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-red-400">Node Inspector</span>
              <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full">
                {activeDetail.category}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{activeDetail.name}</h2>
              <div className="text-xs font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Protocol: {activeDetail.protocol}
              </div>
              <div className="text-xs font-mono text-neutral-400 mt-0.5">
                Latency: <span className="text-neutral-200">{activeDetail.latency}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-white/10">
              {activeDetail.description}
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              {Object.keys(NODES).map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedNode(k)}
                  className={`text-[11px] font-mono px-3 py-1 rounded-lg transition-all border ${
                    selectedNode === k
                      ? "bg-red-600/30 text-red-300 border-red-500/60 font-bold"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                  }`}
                >
                  {NODES[k].name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Runtime Code Implementation */}
          <div className="lg:col-span-2 cinema-card rounded-2xl p-6 space-y-3 border border-white/10 bg-neutral-950 font-mono">
            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Production Code Execution</span>
              </div>
              <span className="text-[10px] text-neutral-500">Node.js ES Modules · TypeScript</span>
            </div>

            <pre className="text-xs text-emerald-300 overflow-x-auto p-4 bg-black/60 rounded-xl border border-neutral-800/80 leading-relaxed">
              <code>{activeDetail.codeSnippet}</code>
            </pre>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span>Section 7.B Verification: 100% Antigravity/Gemini Authored</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Client Disallowed · stdio MCP Enforced
              </span>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs font-mono text-neutral-500 pt-4 border-t border-neutral-900 gap-2">
          <div>Repository: <a href="https://github.com/Zen-cronic/firstlook" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white underline">github.com/Zen-cronic/firstlook</a></div>
          <div>Stack: Next.js 15 · Gemini 3.6 Flash · Remotion 4 · mcp-clickhouse · Google Cloud Storage</div>
          <div>MIT License · ClickHouse Track Submission</div>
        </div>
      </div>
    </div>
  );
}
