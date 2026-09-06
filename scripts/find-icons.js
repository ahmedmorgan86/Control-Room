const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for pN and pD or camera view icons
const idx = content.indexOf("function pN(");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 300));
}
const idx2 = content.indexOf("function pD(");
if (idx2 !== -1) {
  console.log(content.slice(idx2, idx2 + 300));
}
