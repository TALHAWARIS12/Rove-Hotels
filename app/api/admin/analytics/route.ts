import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    const totalFeedbacks = await prisma.feedback.count();
    const positiveFeedbacks = await prisma.feedback.count({ where: { rating: { gte: 4 } } });
    const totalUnanswered = await prisma.unknownQuestion.count();
    const resolvedUnanswered = await prisma.unknownQuestion.count({ where: { status: "resolved" } });

    const totalFaqs = await prisma.faq.count();
    const totalChunks = await prisma.kbChunk.count();

    const satisfactionRate = totalFeedbacks > 0 ? Math.round((positiveFeedbacks / totalFeedbacks) * 100) : 100;
    const resolutionRate = totalUnanswered > 0 ? Math.round((resolvedUnanswered / totalUnanswered) * 100) : 100;

    return NextResponse.json({
      totalConversations,
      totalMessages,
      totalFeedbacks,
      satisfactionRate,
      totalUnanswered,
      resolutionRate,
      totalFaqs,
      totalChunks,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
