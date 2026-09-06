const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for the export default of the 3D chunk
const idx = content.indexOf('e.s(["default"');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 1000));
}
