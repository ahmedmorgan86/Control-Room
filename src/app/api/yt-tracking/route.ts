import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(req: NextRequest) {
  try {
    const terminal = (req.nextUrl.searchParams.get("terminal") || "ACT").toUpperCase();
    const res = await proxy(`/api/yt-tracking?terminal=${terminal}`, undefined, req.headers);
    if (!res.ok) {
      return NextResponse.json([], { status: res.status });
    }
    const body = await res.json().catch(() => []);
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
