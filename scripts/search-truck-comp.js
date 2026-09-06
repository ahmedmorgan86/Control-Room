const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-full.js"), "utf8");
// Let's search for truck component name in fu-full.js
const regex = /function\s+([a-zA-Z0-9_$]+)\(\{layout/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log("Found function:", m[1]);
}
