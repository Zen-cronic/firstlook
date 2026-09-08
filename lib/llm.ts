import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

export async function generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T> {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || "You are an expert film-marketing agent. Output strictly valid JSON matching the requested structure.",
      responseMimeType: "application/json",
    },
  });

  const text = response.text || "";
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("Failed to parse Gemini JSON output:", text);
    throw new Error("Invalid JSON response from Gemini API.");
  }
}
