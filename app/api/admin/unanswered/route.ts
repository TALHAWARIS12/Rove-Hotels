import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/llm/embeddings";

export async function GET() {
  try {
    const questions = await prisma.unknownQuestion.findMany({
      orderBy: { occurredCount: "desc" },
    });
    return NextResponse.json(questions);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { questionId, answer } = await req.json();

    if (!questionId || !answer) {
      return NextResponse.json({ error: "questionId and answer are required" }, { status: 400 });
    }

    const questionRecord = await prisma.unknownQuestion.findUnique({
      where: { id: questionId },
    });

    if (!questionRecord) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // 1. Update UnknownQuestion status
    const updatedQuestion = await prisma.unknownQuestion.update({
      where: { id: questionId },
      data: { status: "resolved", adminAnswer: answer },
    });

    // 2. Write to Faq table as verified fact
    await prisma.faq.upsert({
      where: { question: questionRecord.questionText },
      update: { answer, verified: true, category: "Admin Resolved" },
      create: {
        question: questionRecord.questionText,
        answer,
        verified: true,
        category: "Admin Resolved",
        hotelId: "rove_downtown_dubai",
      },
    });

    // 3. Create verified KbChunk with vector embedding
    const content = `Q: ${questionRecord.questionText}\nA: ${answer}`;
    const embedding = await embedText(content);

    const createdChunk = await prisma.kbChunk.create({
      data: {
        content,
        category: "Admin Answered",
        verified: true,
        hotelId: "rove_downtown_dubai",
      },
    });

    if (embedding && embedding.length > 0) {
      const vectorString = `[${embedding.join(",")}]`;
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "KbChunk" SET embedding = $1::vector WHERE id = $2`,
          vectorString,
          createdChunk.id
        );
      } catch (e) {
        // Ignore vector assignment error if fallback DB mode
      }
    }

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (err) {
    console.error("Error resolving unknown question:", err);
    return NextResponse.json({ error: "Failed to resolve question" }, { status: 500 });
  }
}
