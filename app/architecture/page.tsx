"use client";

import React from "react";
import Link from "next/link";
import { 
  Database, 
  Sparkles, 
  Film, 
  Cloud, 
  Calendar, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck 
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black uppercase tracking-wider font-mono">FirstLook Architecture</h1>
                <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded">
                  System Dataflow
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Autonomous Film-Marketing Agent · ClickHouse Track · Section 7.B Compliant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-lg">
              <Database className="w-3.5 h-3.5" /> 4.56B Rows Scanned
            </span>
            <span className="flex items-center gap-1.5 text-red-400 bg-red-950/60 border border-red-800/80 px-3 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" /> mcp-clickhouse
            </span>
          </div>
        </div>

        {/* High-Level Diagram Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Box 1: Ingestion & Briefing */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Layer 1</span>
                <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">Next.js 15</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-red-400" /> Filmmaker Brief
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Uploads raw 4K footage (Sintel CC-BY), keyframe poster, release schedule, and strict spoiler negative constraints.
              </p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
              <div>• 4K Video Uploads</div>
              <div>• Spoiler Avoidance Rules</div>
              <div>• Release Date Metadata</div>
            </div>
          </div>

          {/* Box 2: Multimodal Orchestrator */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Layer 2</span>
                <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">Gemini 3.6 Flash</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-400" /> Multimodal Planner
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Reasons across scene composition, selects narrative cuts, and crafts platform copy without leaking plot twists.
              </p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
              <div>• Asset Grounding Logic</div>
              <div>• Veo 3.1 Proxy Synthesis</div>
              <div>• GENERATED · PROXY Badges</div>
            </div>
          </div>

          {/* Box 3: Remotion Programmatic Engine */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Layer 3</span>
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">Remotion 4</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Media Synthesis
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Headless Chromium renders multi-aspect deliverables with animated captions, audio ducking, and proxy labels.
              </p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
              <div>• 16:9 Widescreen Teaser</div>
              <div>• 9:16 Vertical (TikTok/Reels)</div>
              <div>• 4:5 Feed Keyframe Poster</div>
            </div>
          </div>

          {/* Box 4: GCS Storage & Honest Calendar */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Layer 4</span>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">Google Cloud</span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" /> Honest Calendar
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Scheduled campaign rollout. State machine transitions to Published · SIM — publishing is simulated, preserving honesty.
              </p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 border border-neutral-800 text-[11px] font-mono text-neutral-300 space-y-1">
              <div>• gs://agentic-cinema-2026-media</div>
              <div>• Published · SIM State Machine</div>
              <div>• No Live Credential Leak</div>
            </div>
          </div>
        </div>

        {/* Load-Bearing ClickHouse MCP Core (Center Stage) */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Hero-Tech Core · Section 7.B Stage-One Gate
                </span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <span>ClickHouse OLAP Backbone via Official mcp-clickhouse Server</span>
                  <span className="text-xs font-mono font-normal bg-black/60 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                    stdio protocol
                  </span>
                </h3>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-2xl font-black text-emerald-400">4,557,605,031</div>
              <div className="text-[10px] text-neutral-400 uppercase">Total Real Rows Scanned in Sub-Seconds</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-black/80 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> 1. MCP stdio Transport
              </div>
              <p className="text-xs text-neutral-400">
                All runtime reads and writes execute through <code className="text-neutral-200">uvx mcp-clickhouse</code> <code className="text-emerald-300">run_query</code> tool calls. Zero direct DB clients.
              </p>
            </div>

            <div className="bg-black/80 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> 2. 4.56B YouTube Benchmark
              </div>
              <p className="text-xs text-neutral-400">
                Queries <code className="text-neutral-200">youtube.youtube</code> dataset. Computes real median (0.50%) and p90 (2.91%) engagement over 44,000+ theatrical trailers.
              </p>
            </div>

            <div className="bg-black/80 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> 3. Gemini Revision Loop
              </div>
              <p className="text-xs text-neutral-400">
                Simulated impressions stream into <code className="text-neutral-200">campaign_events</code> MergeTree table. Gemini inspects telemetry to rewrite underperforming hooks.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-2 border-t border-neutral-900">
          <div>Repository: github.com/Zen-cronic/firstlook</div>
          <div>Stack: Next.js 15 · Gemini 3.6 Flash · Remotion 4 · ClickHouse MCP · Google Cloud Storage</div>
          <div>MIT License</div>
        </div>
      </div>
    </div>
  );
}
