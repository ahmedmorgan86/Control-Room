import { NextRequest } from "next/server";
import { handleDataRequest } from "@/lib/backend";
import { generateGate } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  return handleDataRequest(request, "/api/gate", () => generateGate(request.nextUrl.searchParams.get("terminal") || "ACT"));
}