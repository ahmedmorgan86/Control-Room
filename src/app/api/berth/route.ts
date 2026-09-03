import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const terminal = (req.nextUrl.searchParams.get("terminal") || "ACT").toUpperCase();
  const ok = terminal === "ACT" || terminal === "DCT";
  try {
    const res = await proxy(`/api/berth?terminal=${ok ? terminal : "ACT"}`, undefined, req.headers);
    if (!res.ok) {
      return NextResponse.json({ vessels: [] }, { status: 200 });
    }
    const body = await res.json().catch(() => ({ vessels: [] }));
    return NextResponse.json(body, { status: 200 });
  } catch {
    return NextResponse.json({ vessels: [] }, { status: 200 });
  }
}
