const fs = require("fs");
const path = require("path");
const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0jxhf8pki69b3.js"), "utf8");
console.log(content);
