import { NextRequest, NextResponse } from "next/server";
import { verifyToken, toFrontendUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sess")?.value;
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: toFrontendUser(user) });
}
