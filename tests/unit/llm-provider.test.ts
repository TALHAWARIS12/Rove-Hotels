import { describe, it, expect } from "vitest";
import { getLLMProvider, AnthropicProvider, OpenAIProvider } from "../../lib/llm/provider";

describe("LLM Provider Adapter & Brand Concierge", () => {
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

  it("should generate grounded text when offline or API keys missing without unconfident disclaimers", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.LLM_PROVIDER = "anthropic";

    const provider = getLLMProvider();
    const result = await provider.generate({
      messages: [{ role: "user", content: "What time is check in?" }],
      context: "Check-in starts at 16:00 (4:00 PM) and check-out is at 14:00 (2:00 PM).",
    });

    expect(typeof result).toBe("string");
    expect(result as string).toContain("16:00");
    expect(result as string).toContain("14:00");
    expect(result as string).not.toContain("I don't have a confirmed answer");
    expect(result as string).not.toContain("flag it for our team");
  });

  it("should answer Spanish pool queries confidently with exact hours (08:00 to 20:00)", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.LLM_PROVIDER = "anthropic";

    const provider = getLLMProvider();
    const result = await provider.generate({
      messages: [{ role: "user", content: "À que hora es el pool" }],
      context: "",
    });

    expect(typeof result).toBe("string");
    const response = result as string;
    expect(response).toContain("08:00");
    expect(response).toContain("20:00");
    expect(response).toContain("Burj Khalifa");
    expect(response).not.toContain("No tengo una respuesta confirmada");
    expect(response).not.toContain("I don't have a confirmed answer");
  });

  it("should answer dinner queries with TGI Fridays dining and hours with 100% confidence", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.LLM_PROVIDER = "anthropic";

    const provider = getLLMProvider();
    const result = await provider.generate({
      messages: [{ role: "user", content: "At what time is dinner" }],
      context: "",
    });

    expect(typeof result).toBe("string");
    const response = result as string;
    expect(response).toContain("TGI Fridays");
    expect(response).not.toContain("I don't have a confirmed answer");
    expect(response).not.toContain("flag it for our team");
  });
});
