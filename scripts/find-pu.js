const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for fv or other functions that define terminal layout data parsing (pU)
const idx = content.indexOf("pU=");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 1000));
} else {
  const idx2 = content.indexOf("function pU");
  if (idx2 !== -1) {
    console.log(content.slice(idx2, idx2 + 1000));
  } else {
    console.log("pU not found");
  }
}
