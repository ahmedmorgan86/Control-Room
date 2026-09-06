const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-very-long.js"), "utf8");
// Let's find where return statement is or search for map calls inside return
const match = content.match(/return\s*\(?\s*\(?0,\s*U\.jsxs?\)\s*\(\s*U\.Fragment/);
if (match) {
  const sub = content.slice(match.index);
  fs.writeFileSync(path.join(__dirname, "fu-render.js"), sub.slice(0, 20000));
  console.log("Saved fu-render.js!");
} else {
  console.log("Fragment return not found");
}
