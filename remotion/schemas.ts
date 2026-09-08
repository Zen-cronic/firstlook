import { z } from "zod";

export const ClipItemSchema = z.object({
  src: z.string(),
  durationInFrames: z.number().default(150),
  isProxy: z.boolean().default(false),
  label: z.string().optional(),
});

export const CaptionItemSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  durationInFrames: z.number(),
});

export const TeaserPropsSchema = z.object({
  title: z.string().default("UNTITLED FILM"),
  tagline: z.string().default("IN THEATERS & STREAMING"),
  clips: z.array(ClipItemSchema).default([]),
  captions: z.array(CaptionItemSchema).default([]),
  audioSrc: z.string().optional(),
  teaserDurationInFrames: z.number().default(450),
});

export const PosterPropsSchema = z.object({
  title: z.string().default("UNTITLED FILM"),
  tagline: z.string().default("COMING SOON"),
  imageSrc: z.string(),
  releaseDate: z.string().default("OCTOBER 2026"),
  isProxy: z.boolean().default(false),
});

export type ClipItem = z.infer<typeof ClipItemSchema>;
export type CaptionItem = z.infer<typeof CaptionItemSchema>;
export type TeaserProps = z.infer<typeof TeaserPropsSchema>;
export type PosterProps = z.infer<typeof PosterPropsSchema>;
