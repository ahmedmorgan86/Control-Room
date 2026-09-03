import { NextRequest, NextResponse } from "next/server";
import { BACKEND } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const terminal = req.nextUrl.searchParams.get("terminal") || "ACT";
  const url = `${BACKEND}/TerminalLayout_${terminal}.svg`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to load layout" }, { status: res.status });
    }
    const svgText = await res.text();
    return new NextResponse(svgText, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
