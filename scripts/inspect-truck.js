const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for fr (truck mesh) or ft (truck lights/details)
const idx = content.indexOf("function fr(");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 2000));
}
