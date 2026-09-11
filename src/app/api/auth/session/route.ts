import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });

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
    return NextResponse.json({ authenticated: false }, { status: 502 });
  }
}
