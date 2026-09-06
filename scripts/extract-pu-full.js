const fs = require("fs");
const path = require("path");

const chunk = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
const idx = chunk.indexOf("function pU(");
if (idx !== -1) {
  fs.writeFileSync(path.join(__dirname, "pu-full.js"), chunk.slice(idx, idx + 10000));
  console.log("Saved pu-full.js (10,000 chars)");
}
