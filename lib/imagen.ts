import { getGenAI } from "./llm";
import { uploadToGCS } from "./storage";
import fs from "node:fs";
import path from "node:path";

export interface ConceptArtOptions {
  title: string;
  logline: string;
  genre: string;
  targetAudience?: string;
  promptOverride?: string;
  outputPath: string;
}

export interface GeneratedAssetResult {
  localPath: string;
  publicUrl?: string;
  isProxy: boolean;
  label: string;
}

/**
 * Generate high-definition concept art / motion poster still using Google Image Generation.
 * All generated outputs carry the honest PROXY / GENERATED marker.
 */
export async function generateConceptArt(options: ConceptArtOptions): Promise<GeneratedAssetResult | null> {
  const ai = getGenAI();

  const prompt = options.promptOverride || `
    Cinematic dramatic theatrical movie poster visual for an epic ${options.genre} film titled "${options.title}".
    Story premise: ${options.logline}.
    Target Audience: ${options.targetAudience || "General Cinema Audience"}.
    Style: 8k resolution, cinematic lighting, master composition, dramatic color grading, theatrical release still. No text overlays, purely high-end visual art.
  `.trim();

  // Try candidate image generation models
  const candidateModels = ["gemini-2.5-flash-image", "gemini-3.1-flash-image-preview"];

  for (const model of candidateModels) {
    try {
      console.log(`[Imagen] Generating concept art via ${model} for "${options.title}"...`);
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
            console.log(`[Imagen] Concept art written to ${options.outputPath} (${buffer.length} bytes)`);

            // Upload to Google Cloud Storage
            const storageDir = process.env.STORAGE_DIR
              ? path.resolve(process.cwd(), process.env.STORAGE_DIR)
              : path.resolve(process.cwd(), "storage");
            const relPath = path.relative(storageDir, options.outputPath);
            const gcsDest = relPath.startsWith("..") ? `renders/art/${path.basename(options.outputPath)}` : relPath;
            const gcsUrl = await uploadToGCS(options.outputPath, gcsDest);

            return {
              localPath: options.outputPath,
              publicUrl: gcsUrl || undefined,
              isProxy: true,
              label: "GENERATED · PROXY CONCEPT ART",
            };
          }
        }
      }
    } catch (err: any) {
      console.warn(`[Imagen] Model ${model} generation attempt note:`, err?.message || err);
    }
  }

  return null;
}
