const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");

// Search for JSX calls or component structure
const matches = [];
const terms = ["terminalCode", "isDarkMode", "YT Tracker", "Active Fleet", "usePolling", "/api/yt-tracking", "canvas", "Canvas", "trucks", "Trucks"];

for (const term of terms) {
  let idx = 0;
  console.log(`\n--- Term: "${term}" ---`);
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log(`Match at ${idx}:`);
    console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 300)));
    idx += term.length;
    if (idx > content.length) break;
  }
}
