import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const terminal = (req.nextUrl.searchParams.get("terminal") || "ACT").toUpperCase();
  const ok = terminal === "ACT" || terminal === "DCT";
  try {
    const res = await proxy(`/api/vessels?terminal=${ok ? terminal : "ACT"}`, undefined, req.headers);
    if (!res.ok) {
      return NextResponse.json(getMockVessels(terminal), { status: 200 });
    }
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json(getMockVessels(terminal), { status: 200 });
  }
}

function getMockVessels(terminal: string) {
  return [
    {
      vesselCode: "MSC-01",
      vesselName: `MSC GISELLA (${terminal})`,
      voyageNumber: "MSCG2401",
      arrivalTime: new Date().toISOString(),
      gmph: 34.5,
      loadingDone: 420,
      loadingTotal: 850,
      dischargingDone: 610,
      dischargingTotal: 900,
      totalDone: 1030,
      totalMoves: 1750,
      cranes: [
        { craneId: "QC01", layoutRank: 1, movesDone: 280, movesTotal: 450, loadingDone: 120, loadingTotal: 200, dischargingDone: 160, dischargingTotal: 250, mph: 35 },
        { craneId: "QC02", layoutRank: 2, movesDone: 350, movesTotal: 500, loadingDone: 150, loadingTotal: 250, dischargingDone: 200, dischargingTotal: 250, mph: 38 },
        { craneId: "QC03", layoutRank: 3, movesDone: 400, movesTotal: 800, loadingDone: 150, loadingTotal: 400, dischargingDone: 250, dischargingTotal: 400, mph: 32 },
      ],
    },
    {
      vesselCode: "CMA-02",
      vesselName: `CMA CGM LYRA (${terminal})`,
      voyageNumber: "CMAL1209",
      arrivalTime: new Date().toISOString(),
      gmph: 29.8,
      loadingDone: 210,
      loadingTotal: 600,
      dischargingDone: 340,
      dischargingTotal: 700,
      totalDone: 550,
      totalMoves: 1300,
      cranes: [
        { craneId: "QC04", layoutRank: 4, movesDone: 290, movesTotal: 650, loadingDone: 110, loadingTotal: 300, dischargingDone: 180, dischargingTotal: 350, mph: 30 },
        { craneId: "QC05", layoutRank: 5, movesDone: 260, movesTotal: 650, loadingDone: 100, loadingTotal: 300, dischargingDone: 160, dischargingTotal: 350, mph: 29 },
      ],
    },
  ];
}
