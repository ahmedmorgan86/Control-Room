import { NextRequest, NextResponse } from "next/server";
import { mockLoginToken, mockUser, resolveDataMode } from "@/lib/mockData";

// Simple in-memory rate limiter with cleanup
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of loginAttempts) {
    if (now > record.resetAt) loginAttempts.delete(key);
  }
}

function checkRateLimit(ip: string): boolean {
  cleanupExpiredEntries();
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }

  record.count++;
  return true;
}

function localLoginResponse(request: NextRequest) {
  const response = NextResponse.json({ user: mockUser });
  response.cookies.set("auth-token", mockLoginToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 },
      );
    }

    // Basic input sanitization
    const sanitizedUsername = String(username).trim().slice(0, 100);
    const sanitizedPassword = String(password).slice(0, 200);

    if (sanitizedUsername.length === 0 || sanitizedPassword.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 },
      );
    }

    const mode = resolveDataMode();
    if (mode === "simulated") {
      return localLoginResponse(request);
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: sanitizedUsername, password: sanitizedPassword }),
    });

    if (mode === "auto" && !res.ok) {
      return localLoginResponse(request);
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Login failed" }));
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    const response = NextResponse.json({
      user: data.user,
    });

    if (data.token) {
      response.cookies.set("auth-token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }

    // Reset rate limit on successful login
    loginAttempts.delete(ip);

    return response;
  } catch (err) {
    console.error("Login error:", err);
    const mode = resolveDataMode();
    if (mode === "auto") {
      return localLoginResponse(request);
    }
    return NextResponse.json(
      { error: "Backend connection failed" },
      { status: 502 },
    );
  }
}