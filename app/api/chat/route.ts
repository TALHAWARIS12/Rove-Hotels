import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { retrieveHybridContext } from "@/lib/rag/retrieval";
import { getLLMProvider } from "@/lib/llm/provider";

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional(),
  language: z.string().optional().default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = chatRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parseResult.error.format() }, { status: 400 });
    }

    const { message, sessionId = `session_${Date.now()}`, language = "en" } = parseResult.data;

    // 1. Parallelize conversation retrieval/creation and RAG context retrieval
    const [conversation, retrieval] = await Promise.all([
      prisma.conversation.findUnique({
        where: { sessionId },
        include: { messages: { take: 6, orderBy: { createdAt: "asc" } } },
      }).then(async (existing) => {
        if (existing) return existing;
        return prisma.conversation.create({
          data: { sessionId, language },
          include: { messages: true },
        });
      }),
      retrieveHybridContext(message),
    ]);

    // 2. Non-blocking async logging of user message and unknown questions
    (async () => {
      try {
        await prisma.message.create({
          data: {
            role: "user",
            content: message,
            conversationId: conversation.id,
          },
        });

        if (!retrieval.hasSufficientContext || retrieval.hasUnverifiedFacts) {
          await prisma.unknownQuestion.upsert({
            where: { questionText: message },
            update: { occurredCount: { increment: 1 } },
            create: { questionText: message, occurredCount: 1, status: "new" },
          });
        }
      } catch (err) {
        console.warn("Async log error:", err);
      }
    })();

    // 3. Construct Conversation History for LLM
    const pastMessages = conversation.messages.map((m) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
      content: m.content,
    }));
    pastMessages.push({ role: "user", content: message });

    // 4. Invoke LLM Provider Adapter immediately
    const llmProvider = getLLMProvider();
    const result = await llmProvider.generate({
      messages: pastMessages,
      context: retrieval.contextText,
      stream: true,
    });

    // 5. Handle Streamed or Static String Response
    if (typeof result === "string") {
      // Save Assistant Message in background
      prisma.message.create({
        data: {
          role: "assistant",
          content: result,
          sources: JSON.stringify(retrieval.facts.map((f) => f.source)),
          conversationId: conversation.id,
        },
      }).catch((e) => console.warn("Failed to persist assistant message:", e));

      return new Response(result, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Session-ID": sessionId },
      });
    }

    // Transform stream to record message content upon completion
    let fullResponseText = "";
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        fullResponseText += text;
        controller.enqueue(chunk);
      },
      async flush() {
        if (fullResponseText && conversation) {
          try {
            await prisma.message.create({
              data: {
                role: "assistant",
                content: fullResponseText,
                sources: JSON.stringify(retrieval.facts.map((f) => f.source)),
                conversationId: conversation.id,
              },
            });
          } catch (e) {
            console.warn("Failed to persist assistant stream response:", e);
          }
        }
      },
    });

    return new Response(result.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Session-ID": sessionId,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Error in /api/chat route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
