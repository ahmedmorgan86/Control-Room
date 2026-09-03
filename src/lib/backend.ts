const BACKEND =
  process.env.BACKEND_URL ?? "http://172.16.20.249:3000";

async function proxy(
  path: string,
  init?: RequestInit,
  serverHeaders?: Headers,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  serverHeaders?.forEach((v, k) => {
    if (k.toLowerCase() === "cookie") headers["cookie"] = v;
  });
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string>) },
    cache: "no-store",
  });
  return res;
}

export { BACKEND, proxy };
