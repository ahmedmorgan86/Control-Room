const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-very-long.js"), "utf8");
const idx = content.indexOf("function fM(");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 2500));
} else {
  console.log("fM not found");
}
