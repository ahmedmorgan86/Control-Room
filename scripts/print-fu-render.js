const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-render.js"), "utf8");
console.log(content.slice(0, 4000));
