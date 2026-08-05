import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { feedbacks: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return NextResponse.json(conversations);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
