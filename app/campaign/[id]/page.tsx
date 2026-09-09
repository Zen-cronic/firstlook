"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Database,
  Calendar,
  RefreshCw,
  CheckCircle,
  CheckCircle2,
  Play,
  Share2,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  BarChart3,
  Filter,
  ArrowDown,
  Layers,
} from "lucide-react";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: briefId } = use(params);
  const [brief, setBrief] = useState<any>(null);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedFunnelItemId, setSelectedFunnelItemId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [revising, setRevising] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"creative" | "benchmark" | "analytics">("creative");
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async (itemId?: string) => {
    setLoadingAnalytics(true);
    try {
      const url = `/api/analytics?briefId=${briefId}${itemId ? `&itemId=${encodeURIComponent(itemId)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
        if (data.activeItemId) {
          setSelectedFunnelItemId(data.activeItemId);
        }
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/briefs");
      const briefs = await res.json();
      const current = briefs.find((b: any) => b.id === briefId);
      setBrief(current);

      const benchRes = await fetch("/api/benchmark");
      const benchData = await benchRes.json();
      if (benchData && !benchData.error) {
        setBenchmark(benchData);
      }

      await loadAnalytics();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [briefId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadData();
    } catch (err: any) {
      alert("Generate failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevise = async () => {
    setRevising(true);
    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefId }),
      });
      const data = await res.json();
      if (data.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        alert("Publish campaign items on calendar first to generate analytics!");
      }
    } catch (err: any) {
      alert("Revision failed: " + err.message);
    } finally {
      setRevising(false);
    }
  };

  if (loading || !brief) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono text-gray-400">Loading Campaign Cockpit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase font-bold tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>Campaign Cockpit · {brief.genre}</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            {brief.title}
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mt-1">
            {brief.logline}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/campaign/${briefId}/calendar`}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all border border-white/10"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Campaign Calendar</span>
          </Link>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-red-600/30"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini Planning &amp; Rendering...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Campaign Version</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("creative")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "creative"
              ? "border-red-500 text-red-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Creative Versions ({brief.versionsCount})
        </button>

        <button
          onClick={() => setActiveTab("benchmark")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "benchmark"
              ? "border-red-500 text-red-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>ClickHouse 4.56B YouTube Benchmark</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "analytics"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>ClickHouse MV Rollup &amp; Funnel</span>
          {analytics?.rollups?.length > 0 && (
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded-full">
              {analytics.rollups.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Creative Previews */}
      {activeTab === "creative" && (
        <div className="space-y-6">
          {brief.versionsCount === 0 ? (
            <div className="cinema-card rounded-2xl p-12 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-xl font-bold text-gray-200">No Creative Versions Generated Yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Click <strong>"Generate Campaign Version"</strong> above. Gemini 3.6 Flash will plan grounded multi-platform teasers, and the Remotion engine will render 16:9 Teaser, 9:16 Vertical, and 4:5 Poster assets.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 16:9 Teaser Card */}
                <div className="cinema-card rounded-xl overflow-hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-red-400">16:9 Main Teaser</span>
                    <span className="text-[10px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-gray-400">Remotion MP4</span>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-white/10 flex items-center justify-center">
                    <video
                      controls
                      src="/api/media/renders/teaser.mp4"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center justify-between pt-1">
                    <span>Label: <strong>GENERATED · PROXY</strong></span>
                    <span>1920x1080 @ 30fps</span>
                  </div>
                </div>

                {/* 9:16 Vertical Teaser Card */}
                <div className="cinema-card rounded-xl overflow-hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-red-400">9:16 Vertical Teaser</span>
                    <span className="text-[10px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-gray-400">TikTok / Reels</span>
                  </div>
                  <div className="aspect-[9/16] max-h-64 bg-black rounded-lg overflow-hidden relative border border-white/10 mx-auto flex items-center justify-center">
                    <video
                      controls
                      src="/api/media/renders/vertical.mp4"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center justify-between pt-1">
                    <span>Kinetic Captions</span>
                    <span>1080x1920</span>
                  </div>
                </div>

                {/* 4:5 Poster Card */}
                <div className="cinema-card rounded-xl overflow-hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-red-400">4:5 Poster Still</span>
                    <span className="text-[10px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-gray-400">Feed Post</span>
                  </div>
                  <div className="aspect-[4/5] max-h-56 bg-neutral-950 rounded-lg overflow-hidden relative border border-white/10 mx-auto flex items-center justify-center p-1.5 shadow-inner">
                    <img
                      src={brief.poster_path ? `/api/media/uploads/${brief.poster_path}` : ""}
                      alt="Poster"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center justify-between pt-1">
                    <span>Keyframe Still</span>
                    <span>1080x1350</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: ClickHouse 4.56B YouTube Benchmark & Revision */}
      {activeTab === "benchmark" && (
        <div className="space-y-6">
          <div className="cinema-card rounded-2xl p-8 space-y-6 border border-emerald-500/20 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                    <span>4.56B-Row YouTube Trailer Benchmark</span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700 px-2 py-0.5 rounded uppercase">
                      mcp-clickhouse
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">
                    {benchmark?.rowsScanned
                      ? `Scanned ${Number(benchmark.rowsScanned).toLocaleString()} rows in youtube.youtube via mcp-clickhouse stdio transport`
                      : (loading ? "Scanning 4.56B-row ClickHouse dataset via mcp-clickhouse..." : "ClickHouse 4.56B YouTube dataset")}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRevise}
                disabled={revising}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                {revising ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span>Run Gemini Benchmark Revision</span>
              </button>
            </div>

            {/* Benchmark Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-gray-400 uppercase">Trailers Scanned</span>
                <p className="text-2xl font-black font-mono text-white">
                  {benchmark?.videos ? Number(benchmark.videos).toLocaleString() : (loading ? "..." : "--")}
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-gray-400 uppercase">Median Engagement</span>
                <p className="text-2xl font-black font-mono text-amber-400">
                  {benchmark?.medianEngagedPct !== undefined ? `${benchmark.medianEngagedPct}%` : (loading ? "..." : "--")}
                </p>
              </div>

              <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Top 90% (p90) Engagement</span>
                <p className="text-2xl font-black font-mono text-emerald-400">
                  {benchmark?.p90EngagedPct !== undefined ? `${benchmark.p90EngagedPct}%` : (loading ? "..." : "--")}
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-mono text-gray-400 uppercase">Median Trailer Views</span>
                <p className="text-2xl font-black font-mono text-white">
                  {benchmark?.medianViews ? Number(benchmark.medianViews).toLocaleString() : (loading ? "..." : "--")}
                </p>
              </div>
            </div>

            {/* Revision Result Card */}
            {recommendation && (
              <div className="bg-black/80 border border-amber-500/40 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini Data-Grounded Campaign Revision Proposal</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-lg space-y-1">
                    <span className="text-red-400 font-bold uppercase">Original Caption ({recommendation.platform})</span>
                    <p className="text-gray-300 italic">"{recommendation.originalCaption}"</p>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-lg space-y-1">
                    <span className="text-emerald-400 font-bold uppercase">Benchmark-Optimized Revised Caption</span>
                    <p className="text-white font-bold">"{recommendation.suggestedCaption}"</p>
                  </div>
                </div>

                <div className="text-xs text-gray-300 space-y-1 bg-neutral-900 p-4 rounded-lg border border-white/10">
                  <span className="font-mono text-emerald-400 font-bold">Rationale:</span>
                  <p>{recommendation.rationale}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: ClickHouse MV Rollup & windowFunnel */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          {/* Header & Controls */}
          <div className="cinema-card rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-b from-neutral-900 via-neutral-950 to-cyan-950/20 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                    <span>ClickHouse Incremental Rollup &amp; windowFunnel</span>
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-700 px-2 py-0.5 rounded uppercase">
                      mcp-clickhouse
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">
                    AggregatingMergeTree (zero raw scans) · Monotonic windowFunnel(3600) · Tagged <code>synthetic = 1</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/campaign/${briefId}/calendar`}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition-all border border-white/10"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calendar Stream</span>
                </Link>

                <button
                  onClick={() => loadAnalytics(selectedFunnelItemId)}
                  disabled={loadingAnalytics}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? "animate-spin" : ""}`} />
                  <span>Refresh ClickHouse Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty State vs Live Analytics */}
          {!analytics?.rollups || analytics.rollups.length === 0 ? (
            <div className="cinema-card rounded-2xl p-12 text-center space-y-4 border border-white/10">
              <Layers className="w-10 h-10 text-cyan-400 mx-auto" />
              <h3 className="text-xl font-bold text-gray-200">No Published Telemetry in ClickHouse Yet</h3>
              <p className="text-sm text-gray-400 max-w-lg mx-auto">
                Audience engagement events stream into ClickHouse when items are published. Open the <strong>Campaign Calendar</strong> and click <strong>"Publish (Simulated)"</strong> on any scheduled asset to stream realistic event fixtures into ClickHouse.
              </p>
              <div className="pt-2">
                <Link
                  href={`/campaign/${briefId}/calendar`}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Go to Campaign Calendar</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pre-Aggregated Rollup Table */}
              <div className="cinema-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span>Pre-Aggregated Materialized View Rollup (`campaign_rollup`)</span>
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Target table: <code>campaign_rollup</code> · Engine: <code>AggregatingMergeTree</code> · Zero raw table scans at query time
                    </p>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 px-2.5 py-1 rounded-full self-start md:self-auto font-bold">
                    Zero Raw Scans
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Item / Asset</th>
                        <th className="py-3 px-3">Platform</th>
                        <th className="py-3 px-3 text-right">Impressions</th>
                        <th className="py-3 px-3 text-right">Completes</th>
                        <th className="py-3 px-3 text-right">Likes</th>
                        <th className="py-3 px-3 text-right">Clicks</th>
                        <th className="py-3 px-3 text-right">Eng. Rate</th>
                        <th className="py-3 px-3 text-center">Conversion Funnel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {analytics.rollups.map((item: any) => {
                        const engRate = item.impressions > 0 ? ((item.likes / item.impressions) * 100).toFixed(2) : "0.00";
                        const isSelected = selectedFunnelItemId === item.item_id;
                        return (
                          <tr
                            key={item.item_id}
                            className={`hover:bg-white/5 transition-colors ${
                              isSelected ? "bg-cyan-950/20 border-l-2 border-cyan-400" : ""
                            }`}
                          >
                            <td className="py-3 px-3 font-bold text-white">
                              {item.item_id.slice(0, 8)}...
                            </td>
                            <td className="py-3 px-3 text-gray-300">
                              <span className="bg-neutral-800 px-2 py-0.5 rounded text-gray-300">
                                {item.platform}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-white font-bold">
                              {Number(item.impressions).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right text-gray-300">
                              {Number(item.completes).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right text-amber-400 font-bold">
                              {Number(item.likes).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right text-cyan-400 font-bold">
                              {Number(item.clicks).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                              {engRate}%
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedFunnelItemId(item.item_id);
                                  loadAnalytics(item.item_id);
                                }}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                                  isSelected
                                    ? "bg-cyan-600 text-white"
                                    : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                                }`}
                              >
                                {isSelected ? "Active" : "Inspect Funnel"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sequential windowFunnel Visualization */}
              <div className="cinema-card rounded-2xl p-6 border border-white/10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
                      <Filter className="w-4 h-4 text-emerald-400" />
                      <span>ClickHouse windowFunnel(3600) Viewer Progression</span>
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Sequential 1-hour session-level window funnel: <code>Reached → Watched → Engaged → Clicked</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">Cut:</span>
                    <select
                      value={selectedFunnelItemId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedFunnelItemId(newId);
                        loadAnalytics(newId);
                      }}
                      className="bg-neutral-900 border border-white/20 rounded-lg px-3 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    >
                      {analytics.rollups.map((r: any) => (
                        <option key={r.item_id} value={r.item_id}>
                          {r.platform} ({r.item_id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Funnel Stage Bars */}
                {(() => {
                  const f = analytics.funnel || { reached: 0, watched: 0, engaged: 0, clicked: 0 };
                  const maxVal = Math.max(f.reached, 1);
                  const reachedPct = 100;
                  const watchedPct = f.reached > 0 ? ((f.watched / f.reached) * 100).toFixed(1) : "0.0";
                  const engagedPct = f.reached > 0 ? ((f.engaged / f.reached) * 100).toFixed(1) : "0.0";
                  const clickedPct = f.reached > 0 ? ((f.clicked / f.reached) * 100).toFixed(1) : "0.0";

                  const stages = [
                    {
                      label: "Stage 1 · Reached",
                      condition: "kind = 'impression'",
                      count: f.reached,
                      pct: `${reachedPct}%`,
                      barWidth: 100,
                      color: "from-blue-600 to-cyan-500",
                      badge: "100% of Reach",
                    },
                    {
                      label: "Stage 2 · Watched",
                      condition: "kind = 'complete'",
                      count: f.watched,
                      pct: `${watchedPct}%`,
                      barWidth: Math.max((f.watched / maxVal) * 100, 4),
                      color: "from-cyan-600 to-teal-500",
                      badge: `${watchedPct}% Retention`,
                    },
                    {
                      label: "Stage 3 · Engaged",
                      condition: "kind = 'like'",
                      count: f.engaged,
                      pct: `${engagedPct}%`,
                      barWidth: Math.max((f.engaged / maxVal) * 100, 4),
                      color: "from-teal-600 to-emerald-500",
                      badge: `${engagedPct}% Engagement`,
                    },
                    {
                      label: "Stage 4 · Clicked",
                      condition: "kind = 'click'",
                      count: f.clicked,
                      pct: `${clickedPct}%`,
                      barWidth: Math.max((f.clicked / maxVal) * 100, 4),
                      color: "from-amber-600 to-red-500",
                      badge: `${clickedPct}% Conversion`,
                    },
                  ];

                  return (
                    <div className="space-y-4">
                      {stages.map((stage, idx) => (
                        <div key={stage.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white uppercase">{stage.label}</span>
                              <span className="text-gray-500 text-[10px]">({stage.condition})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white">{Number(stage.count).toLocaleString()} viewers</span>
                              <span className="bg-neutral-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                {stage.badge}
                              </span>
                            </div>
                          </div>

                          <div className="h-4 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                              style={{ width: `${stage.barWidth}%` }}
                            />
                          </div>
                        </div>
                      ))}

                      <div className="mt-4 p-3 bg-neutral-900/80 rounded-xl border border-white/10 text-xs font-mono text-gray-400 space-y-1">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ClickHouse Engine Call Signature</span>
                        </div>
                        <p className="text-[11px] text-gray-300">
                          <code>SELECT windowFunnel(3600)(toDateTime(ts), kind='impression', kind='complete', kind='like', kind='click') AS lvl FROM campaign_events WHERE brief_id='{briefId}' AND item_id='{selectedFunnelItemId}' GROUP BY session_id</code>
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
