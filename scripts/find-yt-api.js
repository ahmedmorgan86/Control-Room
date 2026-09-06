const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for "positions" or "yt-tracking" inside 0-3_ksb13w76o.js
const idx = content.indexOf("/api/yt-tracking");
if (idx !== -1) {
  console.log(content.slice(idx - 100, idx + 1200));
}
