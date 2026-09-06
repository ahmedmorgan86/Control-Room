const fs = require("fs");
const path = require("path");

const bundlePath = path.join(__dirname, "0ysf377awgbyb.js");
const code = fs.readFileSync(bundlePath, "utf8");

console.log("=== Code from 79000 to end ===");
console.log(code.slice(78000));
