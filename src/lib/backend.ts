const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function backendFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.details || body.error || `HTTP ${res.status}`);
  }

  return res.json();
}
