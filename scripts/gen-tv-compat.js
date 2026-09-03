// Generates public/tv-compat.css from the compiled Next/Tailwind CSS.
// Tailwind v4 emits utilities inside @layer blocks ("@layer utilities { ... }").
// Older Smart TV browsers ignore @layer, dropping ALL utilities and breaking layout.
// This script re-emits the utility rules as plain unlayered CSS so they apply
// regardless of @layer support. Modern browsers still use the layered version
// (unlayered fallback merely duplicates the same rules harmlessly).
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
// Different hosts lay out the Turbopack/webpack CSS output differently
// (and some, like Vercel, relocate/prune .next/static before this script
// runs as part of packaging the deployment). Check every known location
// instead of assuming just one.
const candidateDirs = [
  path.join(root, ".next", "static", "chunks"),
  path.join(root, ".next", "static", "css"),
  path.join(root, ".next", "server", "chunks"),
];
const outFile = path.join(root, "public", "tv-compat.css");

function extractLayerBodies(css) {
  // Find occurrences of "@layer <name>{" (a layered block, not the order-declaration line)
  const out = [];
  const re = /@layer\s+([A-Za-z0-9_-]+)\s*\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const name = m[1];
    const start = m.index + m[0].length;
    const body = captureBalanced(css, start);
    if (body === null) continue;
    out.push({ name, body });
    // continue scanning after the captured block
    re.lastIndex = start + body.length;
  }
  return out;
}

function captureBalanced(css, openIndex) {
  let depth = 1;
  let i = openIndex;
  const n = css.length;
  while (i < n) {
    const ch = css[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return css.slice(openIndex, i);
      }
    }
    i++;
  }
  return null;
}

function readChunks() {
  const files = [];
  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".css")) files.push(path.join(dir, f));
    }
  }
  return files;
}

function main() {
  const files = readChunks();
  if (files.length === 0) {
    // Don't fail the whole deployment over a Smart TV compatibility
    // fallback. Some hosts (e.g. Vercel) relocate or prune .next/static
    // before this chained script runs, so the compiled CSS may genuinely
    // be unavailable here even though the app built successfully. Leave
    // whatever public/tv-compat.css is already committed in place (it's
    // a checked-in file, regenerated from local/CI builds) rather than
    // aborting the build.
    console.warn(
      "[gen-tv-compat] No compiled CSS found in any of:\n  " +
        candidateDirs.join("\n  ") +
        "\n[gen-tv-compat] Skipping regeneration — keeping the existing public/tv-compat.css as-is. " +
        "Run `npm run build` locally (or in CI where .next/static is intact) to refresh it.",
    );
    return;
  }
  const header = [
    "/*",
    " * Smart TV compatibility fallback.",
    " * Auto-generated from compiled Next CSS (Tailwind v4).",
    " * Tailwind v4 wraps utilities in @layer blocks; older smart TV browsers",
    " * ignore @layer, which would drop every utility class and break the UI.",
    " * This file re-declares those exact rules as unlayered plain CSS so",
    " * the layout works on both modern and older webviews.",
    " * Source: .next/static/chunks/*.css",
    " */",
    "",
  ].join("\n");

  const seen = new Set();
  const parts = [];
  for (const file of files) {
    const css = fs.readFileSync(file, "utf8");
    for (const { name, body } of extractLayerBodies(css)) {
      if (seen.has(body)) continue;
      seen.add(body);
      parts.push(body);
    }
  }
  const joined = parts.join("\n");
  console.log("Extracted layer body chars:", joined.length);
  fs.writeFileSync(outFile, header + joined, "utf8");
  console.log("Wrote", outFile, "(" + joined.split("\n").length + " lines)");
}

main();
