const fs = require("fs");
const path = require("path");

const bundlePath = path.join(__dirname, "0ysf377awgbyb.js");
if (!fs.existsSync(bundlePath)) {
  console.log("Bundle not found at", bundlePath);
  process.exit(1);
}
const code = fs.readFileSync(bundlePath, "utf8");
console.log("Bundle size:", code.length, "bytes");

// Search terms
const searchTerms = [
  "YT Tracker",
  "yt-tracking",
  "terminal-layout",
  "ACT_YT_TRACKER",
  "DCT_YT_TRACKER",
  "Active Fleet",
  "YT #",
  "3D Engine",
  "cameraView",
  "Vessel Monitoring",
  "Yard Monitoring",
  "Equipment Monitor",
  "Terminal Monitoring System"
];

for (const term of searchTerms) {
  let idx = 0;
  console.log(`\n=================== SEARCH: "${term}" ===================`);
  let count = 0;
  while ((idx = code.indexOf(term, idx)) !== -1) {
    count++;
    const start = Math.max(0, idx - 300);
    const end = Math.min(code.length, idx + 400);
    console.log(`\n[Match ${count} at ${idx}]:`);
    console.log(code.slice(start, end));
    idx += term.length;
    if (count >= 5) {
      console.log("... (more matches truncated)");
      break;
    }
  }
  if (count === 0) console.log("NO MATCHES");
}
