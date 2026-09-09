"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Calendar,
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Film,
  ArrowLeft,
  Database,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function CampaignCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: briefId } = use(params);
  const [brief, setBrief] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/briefs");
      const briefs = await res.json();
      const current = briefs.find((b: any) => b.id === briefId);
      setBrief(current);

      const itemsRes = await fetch(`/api/calendar?briefId=${briefId}`);
      const itemsData = await itemsRes.json();
      if (itemsData.items) {
        setItems(itemsData.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [briefId]);

  const handlePublish = async (itemId: string) => {
    setPublishing(itemId);
    setFeedback(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback({
        type: "success",
        message: `Simulated publish completed! Ingested ${data.rowsWritten} impression & engagement events into ClickHouse via mcp-clickhouse.`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: "Publish failed: " + (err.message || "Unknown error"),
      });
    } finally {
      setPublishing(null);
    }
  };

  if (loading || !brief) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono text-gray-400">Loading Campaign Calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <Link
            href={`/campaign/${briefId}`}
            className="inline-flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Campaign Cockpit</span>
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-red-500" />
            <span>Honest-State Campaign Calendar</span>
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Target Release Date: <strong className="text-white">{brief.release_date}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-xs font-mono">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Honesty State: Zero Real Social Accounts Modified</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono ${
            feedback.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/70 border-red-500/40 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filmstrip Timeline */}
      <div className="cinema-card rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            <span>Scheduled Campaign Deliverables (Pre-Release Timeline)</span>
          </h2>
          <span className="text-xs font-mono text-gray-500">{items.length} Items Planned</span>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-white/20"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold uppercase bg-red-950 text-red-400 border border-red-800 px-2.5 py-0.5 rounded">
                    {item.platform}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {item.days} before release
                  </span>
                  {item.state === "published_sim" ? (
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Published · SIM</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Scheduled</span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-white font-medium">{item.caption}</p>
                <div className="text-[11px] font-mono text-gray-500 flex items-center gap-2">
                  <span>ID: {item.id.slice(0, 8)}...</span>
                  <span>•</span>
                  <span>Deliverable: {item.assetKind}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.state === "scheduled" ? (
                  <button
                    onClick={() => handlePublish(item.id)}
                    disabled={publishing === item.id}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    {publishing === item.id ? (
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Publish (Simulated)</span>
                  </button>
                ) : (
                  <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>ClickHouse Events Seeded (mcp-clickhouse)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
