import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

const VALID_TERMINALS = ["ACT", "DCT"] as const;

export async function GET(req: NextRequest) {
  const terminal = (req.nextUrl.searchParams.get("terminal") || "ACT").toUpperCase();
  const safe = VALID_TERMINALS.includes(terminal as typeof VALID_TERMINALS[number]) ? terminal : "ACT";
  try {
    const res = await proxy(`/api/yard?terminal=${safe}`, undefined, req.headers);
    const body = await res.json().catch(() => ({ error: "Invalid response" }));
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
