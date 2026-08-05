import { describe, it, expect } from "vitest";
import { retrieveHybridContext } from "../../lib/rag/retrieval";

describe("Hybrid RAG Retrieval Engine", () => {
  it("should handle queries gracefully and return structured context result", async () => {
    const result = await retrieveHybridContext("Gamer Cave specs");
    expect(result).toHaveProperty("contextText");
    expect(result).toHaveProperty("facts");
    expect(result).toHaveProperty("hasSufficientContext");
    expect(result).toHaveProperty("hasUnverifiedFacts");
  });
});
