import Link from "next/link";
import { getDb, Brief, Asset } from "@/lib/db";
import { Film, Sparkles, Calendar, ArrowRight, Play, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = getDb();
  const briefs = db.prepare("SELECT * FROM briefs ORDER BY created_at DESC").all() as unknown as Brief[];

  const briefList = briefs.map((b) => {
    const assets = db.prepare("SELECT * FROM assets WHERE brief_id = ?").all(b.id) as unknown as Asset[];
    const versions = db.prepare("SELECT * FROM creative_versions WHERE brief_id = ? ORDER BY version_number DESC").all(b.id);
    return { ...b, assets, versions };
  });

  return (
    <div className="space-[#0a0a0c] space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden cinema-card p-10 bg-gradient-to-r from-neutral-900 via-neutral-950 to-red-950/40 border border-white/10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-500/30 text-red-400 font-mono text-xs px-3.5 py-1 rounded-full uppercase tracking-wider font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Spend Campaign Benchmark Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
            Test Your Film Campaign Against Real Releases <span className="text-red-600">Before You Spend</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Brief a film, let Gemini plan grounded multi-platform teasers, render Remotion compositions with labeled proxies, and benchmark performance against ClickHouse’s <strong>4.56B-row public YouTube dataset via mcp-clickhouse</strong>.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/brief"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/30"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create New Film Brief</span>
            </Link>

            <a
              href="#briefs-section"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium px-6 py-3.5 rounded-xl transition-all"
            >
              <span>View Campaigns ({briefList.length})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Active Film Briefs */}
      <div id="briefs-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-red-500" />
            <span>Active Film Campaigns</span>
          </h2>
          <span className="text-xs font-mono text-gray-500">
            {briefList.length} Campaign{briefList.length === 1 ? "" : "s"}
          </span>
        </div>

        {briefList.length === 0 ? (
          <div className="cinema-card rounded-xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-300">No Film Briefs Created Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Start by briefing a film or seeding sample 4K cinema assets from Blender's CC-BY film <em>Sintel</em>.
            </p>
            <div className="pt-2">
              <Link
                href="/brief"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Brief a Film</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {briefList.map((brief) => {
              const posterUrl = brief.poster_path ? `/api/media/uploads/${brief.poster_path}` : null;
              const clipsCount = brief.assets.filter((a) => a.kind === "clip").length;

              return (
                <div
                  key={brief.id}
                  className="cinema-card rounded-xl overflow-hidden group hover:border-red-500/50 transition-all flex flex-col"
                >
                  {/* Poster Thumbnail Header */}
                  <div className="relative h-48 bg-neutral-950 overflow-hidden">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={brief.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-red-950 flex items-center justify-center p-6 text-center">
                        <span className="font-extrabold text-2xl uppercase tracking-tighter text-neutral-400">
                          {brief.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono uppercase text-red-400 border border-white/10">
                      {brief.genre}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-red-500 transition-colors">
                        {brief.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 font-sans">
                        {brief.logline}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/5 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-red-400" />
                          <span>{clipsCount} Grounded Clips</span>
                        </span>
                        <span className="font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{brief.versions.length} Versions</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Release: {brief.release_date}</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/campaign/${brief.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all"
                      >
                        <span>Open Campaign Cockpit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
