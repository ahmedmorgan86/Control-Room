const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-full.js"), "utf8");
// Let's search for truck or .map in the return statement of fU
const returnIdx = content.lastIndexOf("return");
console.log(content.slice(returnIdx));
