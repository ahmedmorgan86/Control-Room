import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");

// Where the real app lives. All /api|/auth/... requests and any unknown
// asset that isn't bundled locally are forwarded here.
const BACKEND_URL = process.env.BACKEND_URL || "http://172.16.20.249:3000";

const PORT = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
};

function extOf(p) {
  return path.extname(p).toLowerCase();
}

function contentType(p) {
  return MIME[extOf(p)] || "application/octet-stream";
}

// Resolve a request path to a file inside PUBLIC_DIR (prevents traversal).
function resolveLocal(p) {
  const clean = decodeURIComponent((p || "/").split("?")[0]);
  let rel = clean;
  if (rel.startsWith("/")) rel = rel.slice(1);
  if (rel === "") rel = "index.html";
  const abs = path.resolve(PUBLIC_DIR, rel);
  return abs.startsWith(PUBLIC_DIR) ? abs : null;
}

function proxyRequest(urlPath, req, res) {
  const target = new URL(urlPath, BACKEND_URL);
  const headers = Object.assign({}, req.headers);
  headers.host = target.host;

  const preq = http.request(
    target,
    {
      method: req.method,
      headers,
    },
    (pres) => {
      const out = Object.assign({}, pres.headers);
      // Strip hop-by-hop / framing headers that would confuse the browser
      // when served from localhost.
      delete out["content-encoding"];
      delete out["transfer-encoding"];
      delete out["content-length"];
      res.writeHead(pres.statusCode, out);
      pres.pipe(res);
    },
  );
  preq.on("error", (err) => {
    if (res.headersSent) {
      res.end();
    } else {
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "proxy_error", detail: String(err.message) }));
    }
  });
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    req.pipe(preq);
  } else {
    preq.end();
  }
}

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";
  const urlPath = url.split("?")[0];

  // Forward API + auth + unknown non-static paths to the backend.
  const isApi = urlPath.startsWith("/api/") || urlPath.startsWith("/api");
  const isAuth = urlPath.startsWith("/auth");
  if (isApi || isAuth) {
    return proxyRequest(url, req, res);
  }

  // Prevent 404s for /_next/ routes that point at unbuilt chunks: proxy them.
  if (urlPath.startsWith("/_next/") || urlPath.startsWith("/static/")) {
    if (resolveLocal(urlPath)) {
      // fall through to local static serving below
    } else {
      return proxyRequest(url, req, res);
    }
  }

  const abs = resolveLocal(urlPath);
  if (abs && extOf(urlPath) !== "") {
    try {
      const data = await fs.readFile(abs);
      res.writeHead(200, {
        "content-type": contentType(urlPath),
        "content-length": data.length,
        "cache-control": "no-cache",
      });
      res.end(data);
      return;
    } catch {
      // fall through to proxy
    }
  }

  // Root and non-hashed paths: serve index.html, or proxy to backend.
  const rootIndex = resolveLocal("/");
  if (abs && rootIndex && abs === rootIndex) {
    const data = await fs.readFile(rootIndex);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(data);
    return;
  }

  // Default: proxy to the backend (handles /, unknown assets, etc).
  return proxyRequest(url, req, res);
});

server.listen(PORT, async () => {
  console.log(`Replica serving http://localhost:${PORT}`);
  console.log(`Proxying API/auth to ${BACKEND_URL}`);
});