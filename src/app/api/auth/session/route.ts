import { NextRequest, NextResponse } from "next/server";
import { mockUser, resolveDataMode } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const mode = resolveDataMode();
  if (mode === "simulated") {
    return NextResponse.json({ authenticated: true, user: mockUser });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (mode === "auto" && !res.ok) {
      return NextResponse.json({ authenticated: true, user: mockUser });
    }

    if (!res.ok) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json({
      authenticated: true,
      user: data.user,
    });
  } catch (err) {
    console.error("Session validation error:", err);
    if (mode === "auto") {
      return NextResponse.json({ authenticated: true, user: mockUser });
    }
    return NextResponse.json({ authenticated: false }, { status: 502 });
  }
}