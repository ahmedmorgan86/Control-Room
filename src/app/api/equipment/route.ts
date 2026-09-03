import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const terminal = (req.nextUrl.searchParams.get("terminal") || "ACT").toUpperCase();
  const ok = terminal === "ACT" || terminal === "DCT";
  try {
    const res = await proxy(`/api/equipment?terminal=${ok ? terminal : "ACT"}`, undefined, req.headers);
    if (!res.ok) {
      return NextResponse.json(getMockEquipment(), { status: 200 });
    }
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json(getMockEquipment(), { status: 200 });
  }
}

function getMockEquipment() {
  return {
    totalActive: 24,
    totalOnline: 28,
    qcGroups: [
      {
        qcNo: "QC01",
        pendingOrdersCount: 12,
        ytCards: [
          { equNo: "YT101", equType: "YT", displayName: "YT-101", isOnline: true, driverName: "Ahmed Mohamed", jobType: "DISCH", position: "B01", tttMinutes: 14, movesLastHour: 18, assignedQc: "QC01" },
          { equNo: "YT102", equType: "YT", displayName: "YT-102", isOnline: true, driverName: "Mahmoud Ali", jobType: "LOAD", position: "B02", tttMinutes: 32, movesLastHour: 14, assignedQc: "QC01" },
        ],
      },
      {
        qcNo: "QC02",
        pendingOrdersCount: 8,
        ytCards: [
          { equNo: "YT103", equType: "YT", displayName: "YT-103", isOnline: true, driverName: "Ibrahim Hassan", jobType: "DISCH", position: "D01", tttMinutes: 8, movesLastHour: 22, assignedQc: "QC02" },
        ],
      },
    ],
    yardSections: [
      {
        sectionName: "RTG Cluster A",
        equType: "RTG",
        cards: [
          { equNo: "RTG01", equType: "RTG", displayName: "RTG-01", isOnline: true, driverName: "Sayed Omar", position: "A01", tttMinutes: 10, movesLastHour: 25 },
          { equNo: "RTG02", equType: "RTG", displayName: "RTG-02", isOnline: true, driverName: "Mostafa Kamal", position: "A02", tttMinutes: 12, movesLastHour: 20 },
        ],
      },
    ],
  };
}
