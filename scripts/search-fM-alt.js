const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-very-long.js"), "utf8");
// Let's find fM definition or component name for truck rendering
const regex = /function\s+([a-zA-Z0-9_$]+)\(\{layout/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log("Found function:", m[1]);
}

// Let's search for truck model or mesh
const idx = content.indexOf("truck");
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 200), idx + 500));
}
