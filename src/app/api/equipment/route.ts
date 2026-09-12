import { NextRequest } from "next/server";
import { handleDataRequest } from "@/lib/backend";
import { generateEquipment } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  return handleDataRequest(request, "/api/equipment", () => generateEquipment(request.nextUrl.searchParams.get("terminal") || "ACT"));
}