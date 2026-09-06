const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
const idx = content.indexOf("function fU({data:e,dark:t,trucks:n");
if (idx !== -1) {
  fs.writeFileSync(path.join(__dirname, "fu-very-long.js"), content.slice(idx, idx + 100000));
  console.log("Saved fu-very-long.js (100,000 chars)");
}
