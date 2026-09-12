import { NextRequest } from "next/server";
import { handleDataRequest } from "@/lib/backend";
import { generateBerth } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  return handleDataRequest(request, "/api/berth", () => generateBerth(request.nextUrl.searchParams.get("terminal") || "ACT"));
}