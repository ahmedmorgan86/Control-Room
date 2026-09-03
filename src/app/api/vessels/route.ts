import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const terminal = (req.nextUrl.searchParams.get("terminal") || "ACT").toUpperCase();
  const ok = terminal === "ACT" || terminal === "DCT";
  const res = await proxy(`/api/vessels?terminal=${ok ? terminal : "ACT"}`, undefined, req.headers);
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
