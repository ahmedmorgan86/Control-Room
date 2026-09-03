import { createHmac, timingSafeEqual } from "crypto";
import type { User } from "@/lib/types";

const SECRET =
  process.env.AUTH_SECRET ?? "terminal-monitoring-control-room-secret";

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "[auth] AUTH_SECRET is not set — using an insecure default secret. Set AUTH_SECRET in .env.local before deploying.",
  );
}

export interface AuthUser {
  username?: string;
  full_name?: string;
  screens?: Record<string, boolean>;
}

export function createToken(user: AuthUser): string {
  const payload = { ...user, exp: Date.now() + 1000 * 60 * 60 * 8 };
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function verifyToken(token: string | undefined | null): AuthUser | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  if (!safeSignatureEquals(sign(b64), sig)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
    return payload as AuthUser;
  } catch {
    return null;
  }
}

function sign(input: string): string {
  return createHmac("sha256", SECRET).update(input).digest("base64url");
}

function safeSignatureEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function toFrontendUser(user: AuthUser): User {
  return {
    username: user.username ?? "",
    full_name: user.full_name ?? user.username ?? "",
    screens: (user.screens ?? {}) as User["screens"],
  };
}
