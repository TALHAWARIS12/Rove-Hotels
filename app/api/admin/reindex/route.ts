import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestKnowledgeBase } from "@/scripts/ingest-kb";

export async function POST(req: NextRequest) {
  try {
    const initialChunks = await prisma.kbChunk.count();

    console.log("Admin triggered Re-indexing Knowledge Base...");
    await ingestKnowledgeBase();

    const finalChunks = await prisma.kbChunk.count();
    const finalFaqs = await prisma.faq.count();
    const finalRooms = await prisma.room.count();

    return NextResponse.json({
      success: true,
      message: "Knowledge base re-indexed successfully!",
      timestamp: new Date().toISOString(),
      counts: {
        chunksBefore: initialChunks,
        chunksAfter: finalChunks,
        faqs: finalFaqs,
        rooms: finalRooms,
      },
    });
  } catch (err) {
    console.error("Error during re-indexing:", err);
    return NextResponse.json(
      { error: "Re-indexing failed", details: (err as Error).message },
      { status: 500 }
    );
  }
}
