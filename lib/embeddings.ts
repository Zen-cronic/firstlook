import { getGenAI } from "./llm";

/**
 * Generate high-dimensional vector embeddings using Google's gemini-embedding-001.
 * Supports dimensional slicing (e.g. 768-d) for efficient vector similarity indexing in ClickHouse.
 */
export async function generateEmbedding(text: string, dimensions: number = 768): Promise<number[]> {
  const ai = getGenAI();

  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const candidate = response.embeddings?.[0] || response.embedding;
    if (candidate?.values) {
      return candidate.values.slice(0, dimensions);
    }
  } catch (err: any) {
    console.warn("[Embeddings] Error generating embedding with gemini-embedding-001:", err?.message || err);
  }

  // Fallback zero vector if embedding call unavailable
  return new Array(dimensions).fill(0);
}

/**
 * Cosine similarity between two vector embeddings.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
