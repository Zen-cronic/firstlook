import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CaptionChip } from "./components/CaptionChip";
import { ProxyBadge } from "./components/ProxyBadge";
import { TeaserProps } from "./schemas";

export const Teaser: React.FC<TeaserProps> = ({
  title,
  tagline,
  clips,
  captions,
  audioSrc,
  teaserDurationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro fade in & Outro fade out
  const opacity = interpolate(
    frame,
    [0, 15, teaserDurationInFrames - 30, teaserDurationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <AbsoluteFill className="bg-black text-white overflow-hidden font-sans" style={{ opacity }}>
      {/* Background Clips Sequence */}
      {clips.length > 0 ? (
        clips.map((clip, idx) => {
          const duration = clip.durationInFrames || 150;
          const startFrame = idx * duration;
          return (
            <Sequence key={idx} from={startFrame} durationInFrames={duration}>
              <AbsoluteFill className="relative">
                <OffthreadVideo
                  src={clip.src}
                  className="w-full h-full object-cover"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  muted
                />
                {clip.isProxy && <ProxyBadge label={clip.label || "GENERATED · PROXY"} />}
              </AbsoluteFill>
            </Sequence>
          );
        })
      ) : (
        <AbsoluteFill className="bg-gradient-to-br from-neutral-900 via-black to-red-950 flex items-center justify-center">
          <div className="text-center px-8" style={{ transform: `scale(${titleScale})` }}>
            <h1 className="text-6xl font-black tracking-widest uppercase mb-4 text-red-500 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-xl font-medium tracking-wider text-neutral-300 uppercase">
              {tagline}
            </p>
          </div>
        </AbsoluteFill>
      )}

      {/* Intro Overlay Title (First 60 frames) */}
      <Sequence from={0} durationInFrames={75}>
        <AbsoluteFill className="bg-black/40 flex items-center justify-center p-12">
          <div className="text-center" style={{ transform: `scale(${titleScale})` }}>
            <h1 className="text-7xl font-black tracking-tighter uppercase text-white drop-shadow-2xl">
              {title}
            </h1>
            <div className="mt-4 inline-block bg-red-600/90 text-white font-mono text-sm px-4 py-1.5 uppercase font-bold tracking-widest rounded-full">
              {tagline}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Captions Overlay */}
      {captions.map((cap, i) => (
        <Sequence key={i} from={cap.startFrame} durationInFrames={cap.durationInFrames}>
          <CaptionChip text={cap.text} />
        </Sequence>
      ))}

      {/* Audio Track */}
      {audioSrc && <Audio src={audioSrc} volume={0.8} />}

      {/* Honesty Stamp Footer */}
      <div className="absolute bottom-4 right-6 z-50 text-[10px] font-mono text-neutral-400 bg-black/60 px-2 py-1 rounded border border-white/10">
        AGENTIC CINEMA PREVIEW · SIMULATED CAMPAIGN
      </div>
    </AbsoluteFill>
  );
};
