const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-full.js"), "utf8");
const idx = content.indexOf('return(0,U.jsxs)(U.Fragment,{children:');
if (idx !== -1) {
  console.log(content.slice(idx));
}
