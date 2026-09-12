import { NextRequest } from "next/server";
import { handleDataRequest } from "@/lib/backend";
import { generateYTTracking } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  return handleDataRequest(request, "/api/yt-tracking", () => generateYTTracking(request.nextUrl.searchParams.get("terminal") || "ACT"));
}