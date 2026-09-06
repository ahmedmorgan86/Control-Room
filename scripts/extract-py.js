const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for fv or pY or p8 or p9 or fU usages
const idx = content.indexOf("function pY(");
if (idx !== -1) {
  fs.writeFileSync(path.join(__dirname, "py-model.js"), content.slice(idx, idx + 4000));
  console.log("Saved py-model.js");
}
