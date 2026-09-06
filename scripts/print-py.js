const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "py-model.js"), "utf8");
console.log(content);
