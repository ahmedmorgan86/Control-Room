const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
const idx = content.indexOf("function fU(");
if (idx !== -1) {
  // Let's see what fU returns or renders
  console.log(content.slice(idx, idx + 1000));
}
