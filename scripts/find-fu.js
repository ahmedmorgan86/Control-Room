const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for fU usage or where fU is exported/defined
const idx = content.indexOf("fU={");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 500));
}
