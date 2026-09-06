const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0ysf377awgbyb.js"), "utf8");
// Let's search for "Tracked" in 0ysf377awgbyb.js
let idx = 0;
while ((idx = content.indexOf("Tracked", idx)) !== -1) {
  console.log("Found Tracked at", idx);
  console.log(content.slice(Math.max(0, idx - 200), idx + 500));
  idx += 10;
}
