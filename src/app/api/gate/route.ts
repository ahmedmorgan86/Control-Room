import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const ALLOWED_TERMINALS = ["ACT", "DCT"];
const FETCH_TIMEOUT = 15000;

export async function GET(request: NextRequest) {
  const terminal = request.nextUrl.searchParams.get("terminal") || "ACT";
  if (!ALLOWED_TERMINALS.includes(terminal)) {
    return NextResponse.json({ details: "Invalid terminal" }, { status: 400 });
  }

  const token = request.cookies.get("auth-token")?.value;
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/gate?terminal=${terminal}&t=${Date.now()}`,
      {
        headers,
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ details: "Backend request timed out" }, { status: 504 });
    }
    return NextResponse.json({ details: "Backend connection failed" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
