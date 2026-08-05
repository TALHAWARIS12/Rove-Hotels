import { describe, it, expect } from "vitest";
import { getLLMProvider, AnthropicProvider, OpenAIProvider } from "../../lib/llm/provider";

describe("LLM Provider Adapter", () => {
  it("should return AnthropicProvider by default or when LLM_PROVIDER=anthropic", () => {
    process.env.LLM_PROVIDER = "anthropic";
    const provider = getLLMProvider();
    expect(provider).toBeInstanceOf(AnthropicProvider);
    expect(provider.name).toBe("anthropic");
  });

  it("should return OpenAIProvider when LLM_PROVIDER=openai", () => {
    process.env.LLM_PROVIDER = "openai";
    const provider = getLLMProvider();
    expect(provider).toBeInstanceOf(OpenAIProvider);
    expect(provider.name).toBe("openai");
  });

  it("should generate fallback grounded text when offline or API keys missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.LLM_PROVIDER = "anthropic";

    const provider = getLLMProvider();
    const result = await provider.generate({
      messages: [{ role: "user", content: "What time is check in?" }],
      context: "Check-in starts at 16:00 (4:00 PM).",
    });

    expect(typeof result).toBe("string");
    expect(result as string).toContain("Rove Downtown Dubai");
    expect(result as string).toContain("16:00");
  });
});
