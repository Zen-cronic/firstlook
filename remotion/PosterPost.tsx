import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { ProxyBadge } from "./components/ProxyBadge";
import { PosterProps } from "./schemas";

export const PosterPost: React.FC<PosterProps> = ({
  title,
  tagline,
  imageSrc,
  releaseDate,
  isProxy,
}) => {
  return (
    <AbsoluteFill className="bg-black text-white overflow-hidden relative font-sans">
      {imageSrc ? (
        <Img src={imageSrc} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-t from-black via-neutral-900 to-red-950 flex items-center justify-center p-8" />
      )}

      {/* Poster Vignette & Text Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-12">
        {isProxy && <ProxyBadge label="GENERATED · PROXY POSTER" />}

        <div className="border-l-4 border-red-600 pl-6 space-y-2">
          <p className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
            {tagline}
          </p>
          <h1 className="text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
            {title}
          </h1>
          <p className="text-sm font-mono text-neutral-300 uppercase tracking-wider pt-2">
            IN THEATERS &amp; STREAMING · {releaseDate}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
