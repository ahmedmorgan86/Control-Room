const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0ysf377awgbyb.js"), "utf8");
let idx = 0;
while ((idx = content.indexOf("driverName", idx)) !== -1) {
  console.log("--- Found driverName at", idx, "---");
  console.log(content.slice(Math.max(0, idx - 300), idx + 500));
  idx += 10;
}
