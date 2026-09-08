"use client";

import { useState, use } from "react";
import { Film, Play, ThumbsUp, Eye, CheckCircle2, Shield } from "lucide-react";

export default function PreviewABPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [voted, setVoted] = useState(false);
  const [activeVariant, setActiveVariant] = useState<"A" | "B">("A");

  const handleVote = async (variant: "A" | "B") => {
    setActiveVariant(variant);
    setVoted(true);
    // Send event to ClickHouse via mcp-clickhouse API
    try {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: `ab_${variant}` }),
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-red-950 text-red-400 border border-red-800 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          <Film className="w-3.5 h-3.5" />
          <span>Consenting Viewer Preview Test</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight">
          SINTEL — Teaser Cut A/B Split Test
        </h1>
        <p className="text-sm text-gray-400">
          Compare Cut A (Action-Driven) vs Cut B (Emotional Hook). Your feedback lands directly in ClickHouse OLAP analytics via <code>mcp-clickhouse</code>.
        </p>
      </div>

      {/* Video Player & Selection */}
      <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/10 flex items-center justify-center">
          <video
            controls
            src={activeVariant === "A" ? "/api/media/renders/teaser.mp4" : "/api/media/renders/vertical.mp4"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveVariant("A")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                activeVariant === "A"
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-gray-400 hover:text-white"
              }`}
            >
              Cut A (Action)
            </button>
            <button
              onClick={() => setActiveVariant("B")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                activeVariant === "B"
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-gray-400 hover:text-white"
              }`}
            >
              Cut B (Emotional)
            </button>
          </div>

          <button
            onClick={() => handleVote(activeVariant)}
            disabled={voted}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
          >
            {voted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Preference Recorded</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                <span>Vote for Cut {activeVariant}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-center text-xs font-mono text-gray-500 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span>Events streamed into ClickHouse via <strong>mcp-clickhouse</strong></span>
      </div>
    </div>
  );
}
