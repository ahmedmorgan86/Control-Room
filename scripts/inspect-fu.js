const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-full.js"), "utf8");
// Let's search for rendering truck or markers
const idx = content.indexOf("x.map");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 2000));
} else {
  console.log("x.map not found");
}
