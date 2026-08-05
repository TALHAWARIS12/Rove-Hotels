import OpenAI from "openai";

export const EMBEDDING_DIMENSION = 1536;

/**
 * Generate a deterministic float vector of dimension EMBEDDING_DIMENSION based on text hashing.
 * Useful for local testing or when API keys are not provided.
 */
export function generateMockEmbedding(text: string, dim: number = EMBEDDING_DIMENSION): number[] {
  const vector: number[] = new Array(dim).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  for (let i = 0; i < dim; i++) {
    const pseudoVal = Math.sin(hash + i * 1.61803398875);
    vector[i] = pseudoVal;
  }

  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => (magnitude === 0 ? 0 : val / magnitude));
}

/**
 * Generate vector embeddings for input text.
 */
export async function embedText(text: string): Promise<number[]> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  if (provider === "openai" && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("xxx")) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (err) {
      console.warn("OpenAI embedding API failed, falling back to mock embedding:", err);
    }
  }

  if (provider === "anthropic" && process.env.VOYAGE_API_KEY && !process.env.VOYAGE_API_KEY.includes("xxx")) {
    try {
      const response = await fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
        },
        body: JSON.stringify({
          input: [text],
          model: "voyage-3-lite",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let emb: number[] = data.data[0].embedding;
        // Pad or truncate to match 1536 dim for database consistency
        if (emb.length < EMBEDDING_DIMENSION) {
          emb = emb.concat(new Array(EMBEDDING_DIMENSION - emb.length).fill(0));
        } else if (emb.length > EMBEDDING_DIMENSION) {
          emb = emb.slice(0, EMBEDDING_DIMENSION);
        }
        return emb;
      }
    } catch (err) {
      console.warn("Voyage AI embedding API failed, falling back to mock embedding:", err);
    }
  }

  // Fallback if keys are placeholders or requests fail
  return generateMockEmbedding(text, EMBEDDING_DIMENSION);
}
