import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const CaptionChip: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 max-w-xl text-center"
      style={{ transform: `translateX(-50%) scale(${scale})` }}
    >
      <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white font-extrabold text-2xl md:text-3xl px-6 py-3 rounded-xl shadow-2xl tracking-wide uppercase">
        {text}
      </div>
    </div>
  );
};
