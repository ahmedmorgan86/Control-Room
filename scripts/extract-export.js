const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
const idx = content.indexOf('e.s(["default"');
if (idx !== -1) {
  fs.writeFileSync(path.join(__dirname, "export-default.js"), content.slice(idx, idx + 5000));
  console.log("Saved export-default.js");
}
