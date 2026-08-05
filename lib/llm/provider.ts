import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GenerateOptions {
  messages: ChatMessage[];
  context: string;
  stream?: boolean;
}

export interface LLMProvider {
  name: string;
  generate(options: GenerateOptions): Promise<ReadableStream<Uint8Array> | string>;
}

const SYSTEM_PROMPT_TEMPLATE = `You are the official AI Concierge for Rove Downtown Dubai.
You must adhere strictly to the following rules:

1. **Strict Context Grounding**:
   - ONLY answer using the provided context below.
   - NEVER use outside knowledge about Rove Hotels, Dubai, or general facts.
   - If the provided context is insufficient, empty, or explicitly marked as UNVERIFIED / "Needs Hotel Confirmation", do NOT state it as a settled fact.
   - Plainly say: "I don't have a confirmed answer for that yet — I'll flag it for our team, but here is what I do know..." and summarize what IS verified.

2. **Brand Persona**:
   - Be welcoming, playful, and helpful in the Rove spirit ("Rovers", "Rovesters", "Happy Roving!").
   - Respond in the SAME language as the guest's message (e.g. if the guest asks in Arabic, answer in Arabic; if in Spanish, answer in Spanish), while translating the English context accurately.

3. **Format**:
   - Keep answers clear, accurate, and concise with bullet points or formatted text where appropriate.

--- CONTEXT START ---
{CONTEXT}
--- CONTEXT END ---`;

/**
 * Clean raw RAG context into structured Markdown bullet points for fallbacks.
 */
function formatContextToMarkdown(rawContext: string): string {
  let cleaned = rawContext
    .replace(/\[VERIFIED HOTEL FACT\]/gi, "")
    .replace(/\[UNVERIFIED - NEEDS HOTEL CONFIRMATION\]/gi, "⚠️ *Needs Confirmation:* ")
    .replace(/\(Category:[^)]+\)/gi, "")
    .replace(/Source:[^\n\r]+/gi, "");

  const blocks = cleaned
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const formattedBlocks: string[] = [];

  for (const block of blocks) {
    const lines = block
      .split(/(?=\b(?:Room Option|Max Occupancy|View|Features|Description|Pricing|Booking Link|Hours|Location|Price|Policy|Distance|Contact|Details|Rules):)/g)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      const bullets = lines
        .map((line) => {
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0 && colonIdx < line.length - 1) {
            const key = line.substring(0, colonIdx).trim();
            const val = line.substring(colonIdx + 1).trim();
            return `• **${key}:** ${val}`;
          }
          return `• ${line}`;
        })
        .join("\n");
      formattedBlocks.push(bullets);
    } else {
      const sentences = block
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      if (sentences.length > 1) {
        formattedBlocks.push(sentences.map((s) => `• ${s}`).join("\n"));
      } else {
        formattedBlocks.push(`• ${block}`);
      }
    }
  }

  return formattedBlocks.join("\n\n");
}

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";

  async generate({ messages, context }: GenerateOptions): Promise<ReadableStream<Uint8Array> | string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey.includes("xxx")) {
      return this.fallbackGenerate(messages, context);
    }

    const anthropic = new Anthropic({ apiKey });
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{CONTEXT}", context || "No specific context retrieved.");

    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    try {
      const stream = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: systemPrompt,
        messages: formattedMessages,
        stream: true,
      });

      const encoder = new TextEncoder();
      return new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        },
      });
    } catch (err) {
      console.warn("Anthropic API call failed, falling back:", err);
      return this.fallbackGenerate(messages, context);
    }
  }

  private fallbackGenerate(messages: ChatMessage[], context: string): string {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    if (context && context.length > 0) {
      const cleanBullets = formatContextToMarkdown(context);
      return `Welcome to Rove Downtown Dubai! 🌍 Here are the verified details from our hotel records:\n\n${cleanBullets}\n\nIs there anything else I can assist you with today?`;
    }
    return `Welcome to Rove Downtown Dubai! I don't have a confirmed answer for "${lastUserMsg}" in our current verified records — I'll flag it for our team to follow up!`;
  }
}

export class OpenAIProvider implements LLMProvider {
  name = "openai";

  async generate({ messages, context }: GenerateOptions): Promise<ReadableStream<Uint8Array> | string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.includes("xxx")) {
      return this.fallbackGenerate(messages, context);
    }

    const openai = new OpenAI({ apiKey });
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{CONTEXT}", context || "No specific context retrieved.");

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        stream: true,
      });

      const encoder = new TextEncoder();
      return new ReadableStream({
        async start(controller) {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        },
      });
    } catch (err) {
      console.warn("OpenAI API call failed, falling back:", err);
      return this.fallbackGenerate(messages, context);
    }
  }

  private fallbackGenerate(messages: ChatMessage[], context: string): string {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    if (context && context.length > 0) {
      const cleanBullets = formatContextToMarkdown(context);
      return `Welcome to Rove Downtown Dubai! 🌍 Here are the verified details from our hotel records:\n\n${cleanBullets}\n\nIs there anything else I can assist you with today?`;
    }
    return `Welcome to Rove Downtown Dubai! I don't have a confirmed answer for "${lastUserMsg}" in our current verified records — I'll flag it for our team to follow up!`;
  }
}

export function getLLMProvider(): LLMProvider {
  const providerName = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
  if (providerName === "openai") {
    return new OpenAIProvider();
  }
  return new AnthropicProvider();
}
