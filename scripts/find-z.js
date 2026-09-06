const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for fU or Z component definition in 0ysf377awgbyb.js or other chunks
const chunk = fs.readFileSync(path.join(__dirname, "original-chunks", "0ysf377awgbyb.js"), "utf8");
const idx = chunk.indexOf("Z=");
if (idx !== -1) {
  console.log(chunk.slice(idx, idx + 500));
}
