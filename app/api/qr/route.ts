import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const baseUrl = (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith("http")) 
    ? process.env.NEXTAUTH_URL 
    : (process.env.RENDER_EXTERNAL_URL || "http://localhost:3000");
  const url = req.nextUrl.searchParams.get("url") || `${baseUrl}/chat`;
  const format = req.nextUrl.searchParams.get("format") || "png";

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(url, {
        type: "svg",
        margin: 2,
        color: { dark: "#da532c", light: "#ffffff" },
      });
      return new Response(svg, {
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    const buffer = await QRCode.toBuffer(url, {
      margin: 2,
      color: { dark: "#da532c", light: "#ffffff" },
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=rove_concierge_qr.png",
      },
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
