const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for function ft
const idx = content.indexOf("function ft(");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 800));
}
