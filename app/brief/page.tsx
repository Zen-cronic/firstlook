"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Upload, Sparkles, AlertCircle } from "lucide-react";

export default function BriefPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [genre, setGenre] = useState("Sci-Fi / Action");
  const [targetAudience, setTargetAudience] = useState("Cinema audiences 18-34, Action & Sci-Fi fans");
  const [releaseDate, setReleaseDate] = useState("2026-10-24");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !logline) {
      setError("Please fill in film title and logline.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("logline", logline);
      formData.append("genre", genre);
      formData.append("targetAudience", targetAudience);
      formData.append("releaseDate", releaseDate);

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/briefs", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create brief");
      }

      router.push(`/campaign/${data.briefId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs uppercase font-bold tracking-wider mb-2">
          <Film className="w-4 h-4" />
          <span>Film Briefing Interface</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          Brief a New Film Campaign
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload film assets (clips, poster art). Gemini will ground campaign planning strictly in these assets without hallucination.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="cinema-card p-8 rounded-2xl space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
            Film Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sintel"
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
            Logline / Briefing Summary *
          </label>
          <textarea
            required
            rows={3}
            value={logline}
            onChange={(e) => setLogline(e.target.value)}
            placeholder="e.g. A lone warrior scours a frozen, unforgiving world for the dragon she rescued, raised, and lost."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Sci-Fi / Fantasy"
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
              Target Release Date
            </label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
            Target Audience Positioning
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. Action-adventure fans, fantasy filmgoers"
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Media File Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
            Upload Video Clips &amp; Poster Art
          </label>
          <div className="relative border-2 border-dashed border-white/10 hover:border-red-500/50 bg-neutral-950 rounded-xl p-8 text-center transition-colors">
            <input
              type="file"
              multiple
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto text-red-500">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-200">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Drag & drop video clips or poster images"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports MP4, MOV, MKV, JPG, PNG
                </p>
              </div>
            </div>
          </div>
          {files.length > 0 && (
            <div className="pt-2 text-xs font-mono text-gray-400 space-y-1">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between bg-neutral-900 px-3 py-1.5 rounded border border-white/5">
                  <span>{f.name}</span>
                  <span className="text-gray-500">{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/30"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Ingesting Assets...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Ingest &amp; Open Cockpit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
