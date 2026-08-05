import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { entity: string } }) {
  const { entity } = params;

  try {
    if (entity === "rooms") return NextResponse.json(await prisma.room.findMany());
    if (entity === "dining") return NextResponse.json(await prisma.restaurant.findMany());
    if (entity === "facilities") return NextResponse.json(await prisma.facility.findMany());
    if (entity === "faqs") return NextResponse.json(await prisma.faq.findMany());
    if (entity === "policies") return NextResponse.json(await prisma.policy.findMany());

    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch entity data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { entity: string } }) {
  const { entity } = params;
  const body = await req.json();

  try {
    if (entity === "faqs") {
      const newFaq = await prisma.faq.upsert({
        where: { question: body.question },
        update: { answer: body.answer, category: body.category || "General", verified: true },
        create: { question: body.question, answer: body.answer, category: body.category || "General", verified: true },
      });
      return NextResponse.json(newFaq);
    }

    return NextResponse.json({ error: "Creation not supported for this entity" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save entity" }, { status: 500 });
  }
}
