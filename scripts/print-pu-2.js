const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "pu-parser.js"), "utf8");
console.log("Length of pu-parser.js:", content.length);
console.log(content.slice(3000));
