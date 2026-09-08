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

export const TeaserVertical: React.FC<TeaserProps> = ({
  title,
  tagline,
  clips,
  captions,
  audioSrc,
  teaserDurationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 15, teaserDurationInFrames - 30, teaserDurationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <AbsoluteFill className="bg-black text-white overflow-hidden font-sans" style={{ opacity }}>
      {/* Background Clips */}
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
        <AbsoluteFill className="bg-gradient-to-b from-neutral-950 via-red-950 to-black flex items-center justify-center p-8">
          <div className="text-center" style={{ transform: `scale(${titleScale})` }}>
            <h1 className="text-5xl font-black tracking-tight uppercase text-white drop-shadow-2xl mb-4">
              {title}
            </h1>
            <p className="text-lg font-bold text-red-500 uppercase tracking-widest">
              {tagline}
            </p>
          </div>
        </AbsoluteFill>
      )}

      {/* Vertical Title Overlay (Intro) */}
      <Sequence from={0} durationInFrames={75}>
        <AbsoluteFill className="bg-black/50 flex flex-col items-center justify-center p-8 text-center">
          <div style={{ transform: `scale(${titleScale})` }}>
            <span className="text-xs font-mono font-bold tracking-widest text-red-500 bg-red-950/80 border border-red-500/30 px-3 py-1 rounded-full uppercase mb-4 inline-block">
              TEASER TRAILER
            </span>
            <h1 className="text-6xl font-black uppercase text-white leading-none mb-4 drop-shadow-2xl">
              {title}
            </h1>
            <p className="text-sm font-semibold text-neutral-300 uppercase tracking-widest">
              {tagline}
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Captions */}
      {captions.map((cap, i) => (
        <Sequence key={i} from={cap.startFrame} durationInFrames={cap.durationInFrames}>
          <CaptionChip text={cap.text} />
        </Sequence>
      ))}

      {audioSrc && <Audio src={audioSrc} volume={0.8} />}

      <div className="absolute top-4 left-4 z-50 text-[10px] font-mono bg-neutral-900/90 text-neutral-300 px-2.5 py-1 rounded border border-neutral-700">
        9:16 VERTICAL SIM
      </div>
    </AbsoluteFill>
  );
};
