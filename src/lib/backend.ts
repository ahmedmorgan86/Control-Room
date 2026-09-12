import { NextRequest, NextResponse } from "next/server";
import { resolveDataMode } from "@/lib/mockData";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const ALLOWED_TERMINALS = ["ACT", "DCT"];
const FETCH_TIMEOUT = 15000;

const SIM_HEADERS = { "x-data-source": "simulated" };
const LIVE_HEADERS = { "x-data-source": "live" };

/**
 * Fetches terminal data from the live backend, falling back to in-process
 * simulated data whenever the backend is unreachable or when DATA_MODE is
 * set to "simulated". This keeps the app fully standalone.
 */
export async function handleDataRequest(
  request: NextRequest,
  path: string,
  mock: () => unknown,
): Promise<NextResponse> {
  const terminal = request.nextUrl.searchParams.get("terminal") || "ACT";
  if (!ALLOWED_TERMINALS.includes(terminal)) {
    return NextResponse.json({ details: "Invalid terminal" }, { status: 400 });
  }

  const mode = resolveDataMode();
  if (mode === "simulated") {
    return NextResponse.json(mock(), { headers: SIM_HEADERS });
  }

  const token = request.cookies.get("auth-token")?.value;
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(
      `${BACKEND_URL}${path}?terminal=${terminal}&t=${Date.now()}`,
      { headers, signal: controller.signal },
    );

    if (mode === "auto" && !res.ok) {
      return NextResponse.json(mock(), { headers: SIM_HEADERS });
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: LIVE_HEADERS });
  } catch (err: unknown) {
    if (mode === "auto") {
      return NextResponse.json(mock(), { headers: SIM_HEADERS });
    }
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ details: "Backend request timed out" }, { status: 504 });
    }
    return NextResponse.json({ details: "Backend connection failed" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}