import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/llm/embeddings";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name;
    const fileType = fileName.split(".").pop()?.toLowerCase() || "";

    let extractedText = "";

    if (fileType === "pdf") {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (fileType === "docx") {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value;
    } else if (fileType === "md" || fileType === "txt") {
      extractedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Unsupported file type. Upload PDF, DOCX, MD, or TXT." }, { status: 400 });
    }

    // Save document metadata
    const docRecord = await prisma.document.create({
      data: {
        title: fileName,
        fileName: fileName,
        fileType: fileType,
        filePath: `uploads/${fileName}`,
        hotelId: "rove_downtown_dubai",
      },
    });

    // Chunk text and store in KbChunk with embeddings
    const paragraphs = extractedText.split("\n\n").filter((p) => p.trim().length > 30);
    let chunksIngested = 0;

    for (const paragraph of paragraphs) {
      const cleanContent = paragraph.trim();
      const embedding = await embedText(cleanContent);

      const createdChunk = await prisma.kbChunk.create({
        data: {
          content: `[Document: ${fileName}]\n${cleanContent}`,
          category: "Uploaded Document",
          sourceUrl: `document:${fileName}`,
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
      chunksIngested++;
    }

    return NextResponse.json({
      success: true,
      document: docRecord,
      chunksIngested,
      message: `Document '${fileName}' processed successfully into ${chunksIngested} RAG chunks!`,
    });
  } catch (err) {
    console.error("Document upload processing error:", err);
    return NextResponse.json({ error: "Failed to process document upload", details: (err as Error).message }, { status: 500 });
  }
}
