import { NextRequest } from "next/server";
import { handleDataRequest } from "@/lib/backend";
import { generateVessels } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  return handleDataRequest(request, "/api/vessels", () => generateVessels(request.nextUrl.searchParams.get("terminal") || "ACT"));
}