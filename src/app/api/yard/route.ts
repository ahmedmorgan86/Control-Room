import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const terminal = (req.nextUrl.searchParams.get("terminal") || "ACT").toUpperCase();
  const ok = terminal === "ACT" || terminal === "DCT";
  try {
    const res = await proxy(`/api/yard?terminal=${ok ? terminal : "ACT"}`, undefined, req.headers);
    if (!res.ok) {
      return NextResponse.json(getMockYard(), { status: 200 });
    }
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json(getMockYard(), { status: 200 });
  }
}

function getMockYard() {
  return {
    blocks: [
      { blockName: "A01", blockType: "STORAGE", fillRatio: 0.82, tierCount: 5, status: "NORMAL" },
      { blockName: "A02", blockType: "STORAGE", fillRatio: 0.91, tierCount: 5, status: "WARNING" },
      { blockName: "B01", blockType: "REEFER", fillRatio: 0.74, tierCount: 4, status: "NORMAL" },
      { blockName: "B02", blockType: "REEFER", fillRatio: 0.95, tierCount: 4, status: "CRITICAL" },
      { blockName: "C01", blockType: "EMPTY", fillRatio: 0.45, tierCount: 6, status: "NORMAL" },
      { blockName: "D01", blockType: "HAZARDOUS", fillRatio: 0.60, tierCount: 3, status: "NORMAL" },
    ],
    violations: [
      { id: "V01", blockName: "B02", description: "Reefer temperature deviation exceeding threshold", severity: "CRITICAL", time: "10:42 AM" },
      { id: "V02", blockName: "A02", description: "Block fill ratio above 90% capacity", severity: "WARNING", time: "10:35 AM" },
    ],
    summary: { totalBlocks: 6, criticalCount: 1, warningCount: 1, normalCount: 4 },
  };
}
