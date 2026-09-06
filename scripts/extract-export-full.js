const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
const idx = content.indexOf('e.s(["default"');
if (idx !== -1) {
  fs.writeFileSync(path.join(__dirname, "export-default-full.js"), content.slice(idx, idx + 20000));
  console.log("Saved export-default-full.js (20,000 chars)");
}
