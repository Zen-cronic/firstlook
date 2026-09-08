import { getGenAI } from "./llm";
import { uploadToGCS } from "./storage";
import fs from "node:fs";
import path from "node:path";

export interface MusicBedOptions {
  title: string;
  genre: string;
  mood?: string;
  outputPath: string;
}

export interface GeneratedMusicResult {
  localPath: string;
  publicUrl?: string;
  isProxy: boolean;
  label: string;
}

/**
 * Generate 30s cinematic music bed using Google Lyria 3.
 * All generated music beds carry the honest PROXY / GENERATED marker.
 */
export async function generateMusicBed(options: MusicBedOptions): Promise<GeneratedMusicResult | null> {
  const ai = getGenAI();

  const prompt = `Cinematic ${options.mood || "dramatic, building, epic"} original soundtrack for ${options.genre} theatrical film trailer titled "${options.title}". Rich orchestral strings, percussion swells, hybrid cinema sound.`;

  const candidateModels = ["lyria-3-clip-preview", "lyria-3.5", "lyria-3-pro-preview"];

  for (const model of candidateModels) {
    try {
      console.log(`[Lyria] Generating original music bed via ${model} for "${options.title}"...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const candidates = response.candidates || [];
      if (candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const buffer = Buffer.from(part.inlineData.data, "base64");
            const dir = path.dirname(options.outputPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(options.outputPath, buffer);
            console.log(`[Lyria] Music bed written to ${options.outputPath} (${buffer.length} bytes)`);

            // Upload to GCS
            const storageDir = process.env.STORAGE_DIR
              ? path.resolve(process.cwd(), process.env.STORAGE_DIR)
              : path.resolve(process.cwd(), "storage");
            const relPath = path.relative(storageDir, options.outputPath);
            const gcsDest = relPath.startsWith("..") ? `renders/audio/${path.basename(options.outputPath)}` : relPath;
            const gcsUrl = await uploadToGCS(options.outputPath, gcsDest);

            return {
              localPath: options.outputPath,
              publicUrl: gcsUrl || undefined,
              isProxy: true,
              label: "GENERATED · PROXY MUSIC BED (Lyria 3)",
            };
          }
        }
      }
    } catch (err: any) {
      console.warn(`[Lyria] Model ${model} generation attempt note:`, err?.message || err);
    }
  }

  return null;
}
