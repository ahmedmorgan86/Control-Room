import { NextResponse } from "next/server";

export async function POST() {
  const nextRes = NextResponse.json({ ok: true });
  nextRes.cookies.set("sess", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return nextRes;
}
