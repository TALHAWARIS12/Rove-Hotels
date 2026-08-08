import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ping: "pong", time: Date.now() }, { status: 200 });
}
