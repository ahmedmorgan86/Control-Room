const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");

const idx = content.indexOf("function fU({data:e,dark:t,trucks:n");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 3000));
} else {
  console.log("fU not found");
}
