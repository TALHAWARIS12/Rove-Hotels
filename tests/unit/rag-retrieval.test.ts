import { describe, it, expect } from "vitest";
import { retrieveHybridContext } from "../../lib/rag/retrieval";

describe("Hybrid RAG Retrieval Engine", () => {
  it("should handle queries gracefully and return structured context result", async () => {
    const result = await retrieveHybridContext("Gamer Cave specs");
    expect(result).toHaveProperty("contextText");
    expect(result).toHaveProperty("facts");
    expect(result).toHaveProperty("hasSufficientContext");
    expect(result).toHaveProperty("hasUnverifiedFacts");
    expect(result.hasUnverifiedFacts).toBe(false);
  });

  it("should handle Spanish pool query without failing", async () => {
    const result = await retrieveHybridContext("À que hora es el pool");
    expect(result).toHaveProperty("contextText");
    expect(result.hasUnverifiedFacts).toBe(false);
  });

  it("should handle English dinner query without unverified disclaimers", async () => {
    const result = await retrieveHybridContext("At what time is dinner");
    expect(result).toHaveProperty("contextText");
    expect(result.hasUnverifiedFacts).toBe(false);
  });
});
