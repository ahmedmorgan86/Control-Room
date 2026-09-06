const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-full.js"), "utf8");
const idx = content.indexOf('x.map(');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 1000));
} else {
  // Let's search for fM or truck rendering
  let i = 0;
  while ((i = content.indexOf("fM", i)) !== -1) {
    console.log(content.slice(i - 50, i + 200));
    i += 2;
    if (i > 10000) break;
  }
}
