import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const feedbackSchema = z.object({
  messageId: z.string().min(1, "messageId is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = feedbackSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid feedback payload", details: parseResult.error.format() }, { status: 400 });
    }

    const { messageId, rating, comment } = parseResult.data;

    const feedback = await prisma.feedback.create({
      data: {
        messageId,
        rating,
        comment,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error("Error saving feedback:", err);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
