import { cookies } from "next/headers";
import type { User } from "@/lib/types";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value || null;
}

export async function validateToken(
  token: string,
): Promise<{ authenticated: boolean; user?: User }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return { authenticated: false };

    const data = await res.json();
    return { authenticated: true, user: data.user };
  } catch {
    return { authenticated: false };
  }
}

export async function requireAuth(): Promise<{ authenticated: boolean; user?: User; token?: string }> {
  const token = await getAuthToken();
  if (!token) return { authenticated: false };
  const result = await validateToken(token);
  return { ...result, token };
}
