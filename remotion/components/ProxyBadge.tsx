import React from "react";

export const ProxyBadge: React.FC<{ label?: string }> = ({ label = "GENERATED · PROXY" }) => {
  return (
    <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-amber-500/90 text-black px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider shadow-lg border border-amber-300">
      <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
      <span>{label}</span>
    </div>
  );
};
