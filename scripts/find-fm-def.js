const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-very-long.js"), "utf8");
// Let's find function fM or whatever name it is before x.map
const idx = content.indexOf("x.map(");
// Look backwards for function name
console.log(content.slice(idx - 200, idx + 100));
