const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0ysf377awgbyb.js"), "utf8");
// Let's search for YT Tracker or active fleet in 0ysf377awgbyb.js
let idx = 0;
while ((idx = content.indexOf("Active Fleet", idx)) !== -1) {
  console.log("Found Active Fleet at", idx);
  console.log(content.slice(Math.max(0, idx - 200), idx + 1000));
  idx += 10;
}
