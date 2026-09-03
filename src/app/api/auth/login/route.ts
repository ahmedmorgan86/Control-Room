import { NextRequest, NextResponse } from "next/server";
import { BACKEND } from "@/lib/backend";
import { createToken, toFrontendUser, type AuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const username = body.username ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  let user: AuthUser | null = null;

  try {
    const res = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const u = json.user ?? json;
      user = {
        username: u.username ?? username,
        full_name: u.full_name ?? username,
        screens: u.screens ?? {},
      };
    }
  } catch {
    user = null;
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const front = toFrontendUser(user);
  const token = createToken(user);
  const nextRes = NextResponse.json({ user: front });
  nextRes.cookies.set("sess", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return nextRes;
}
