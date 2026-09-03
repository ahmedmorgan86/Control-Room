import type { User } from "@/lib/types";

const SECRET =
  process.env.AUTH_SECRET ?? "terminal-monitoring-control-room-secret";

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
  if (sign(b64) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
    return payload as AuthUser;
  } catch {
    return null;
  }
}

function sign(input: string): string {
  let h = 2166136261;
  const s = `${SECRET}:${input}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function toFrontendUser(user: AuthUser): User {
  return {
    username: user.username ?? "",
    full_name: user.full_name ?? user.username ?? "",
    screens: (user.screens ?? {}) as User["screens"],
  };
}
