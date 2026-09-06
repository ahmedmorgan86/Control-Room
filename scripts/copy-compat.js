const fs = require("fs");
const path = require("path");

const srcScript = "E:\\Morgan VIP\\Control Room\\app\\Control Room\\scripts\\gen-tv-compat.js";
const destDir = "E:\\Morgan VIP\\Control Room\\app\\TerminalMonitorClean\\scripts";
const destScript = path.join(destDir, "gen-tv-compat.js");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcScript)) {
  fs.copyFileSync(srcScript, destScript);
  console.log("Copied gen-tv-compat.js successfully!");
} else {
  console.log("Source script not found");
}
