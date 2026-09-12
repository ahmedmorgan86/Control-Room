import { NextRequest } from "next/server";
import { handleDataRequest } from "@/lib/backend";
import { generateYard } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  return handleDataRequest(request, "/api/yard", () => generateYard(request.nextUrl.searchParams.get("terminal") || "ACT"));
}