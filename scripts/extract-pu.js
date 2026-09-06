const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
const idx = content.indexOf("function pU(");
if (idx !== -1) {
  fs.writeFileSync(path.join(__dirname, "pu-parser.js"), content.slice(idx, idx + 4000));
  console.log("Saved pu-parser.js");
}
