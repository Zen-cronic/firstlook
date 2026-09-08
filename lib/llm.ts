import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (aiClient) return aiClient;

  const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";
  const project = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "agentic-cinema-2026-kzh";
  const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.GCP_LOCATION || "us-central1";

  if (useVertex) {
    try {
      console.log(`[LLM] Initializing Google Gen AI on Vertex AI (project: ${project}, location: ${location})`);
      aiClient = new GoogleGenAI({
        vertexai: true,
        project,
        location,
      });
      return aiClient;
    } catch (err) {
      console.warn("[LLM] Vertex AI client initialization warning, falling back to API key:", err);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Neither Vertex AI credentials nor GEMINI_API_KEY environment variable is configured.");
  }
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

export async function generateJSON<T = any>(
  prompt: string,
  systemInstruction?: string,
  preferPro: boolean = false
): Promise<T> {
  const ai = getGenAI();

  // Failover chain using models verified live against Google Generative AI API
  const candidateModels = preferPro
    ? ["gemini-3.1-pro-preview", "gemini-3.8-flash", "gemini-3.6-flash"]
    : ["gemini-3.8-flash", "gemini-3.6-flash"];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction:
            systemInstruction ||
            "You are an expert film-marketing agent. Output strictly valid JSON matching the requested structure.",
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      return JSON.parse(text) as T;
    } catch (err: any) {
      lastError = err;
      console.warn(`[LLM] Model ${model} generation attempt notice (${err?.status || err?.message || err}), trying fallback...`);
    }
  }

  throw new Error(`Failed to generate JSON after model failover chain: ${lastError?.message || lastError}`);
}
