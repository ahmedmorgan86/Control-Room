const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-very-long.js"), "utf8");
// Let's search for x.map(e=>(0,U.jsx)(
const idx = content.indexOf("x.map(");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 500));
} else {
  console.log("x.map not found, let's search for .map(");
  let i = 0;
  while ((i = content.indexOf(".map(", i)) !== -1) {
    console.log(content.slice(i - 30, i + 100));
    i += 10;
    if (i > 10000) break;
  }
}
