const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-full.js"), "utf8");
console.log("Total length of fu-full.js:", content.length);
console.log("Last 2000 chars:\n", content.slice(content.length - 2000));
