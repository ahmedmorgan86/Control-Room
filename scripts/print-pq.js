const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "pq-model.js"), "utf8");
console.log(content.slice(0, 2000));
