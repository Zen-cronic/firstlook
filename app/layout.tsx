import type { Metadata } from "next";
import Link from "next/link";
import { Film, Sparkles, Database } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstLook — Film Marketing Engine",
  description: "Test campaign performance against real theatrical releases using ClickHouse's 4.56B-row YouTube benchmark via mcp-clickhouse",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0a0a0c] text-gray-100 antialiased selection:bg-red-500 selection:text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-white/10 cinema-glass">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight uppercase">FirstLook</span>
                <span className="ml-2 text-[10px] font-mono bg-neutral-800 text-gray-300 border border-white/10 px-2 py-0.5 rounded uppercase font-semibold">
                  Studio Platform
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Campaigns
              </Link>
              <Link href="/brief" className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-red-600/20">
                <Sparkles className="w-4 h-4" />
                <span>New Film Brief</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 text-center text-xs font-mono text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>ClickHouse Cloud Analytics · <strong>mcp-clickhouse</strong> Benchmark Core (4.56B Rows)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
