const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for hJ definition (outline shader or line material)
const idx = content.indexOf("hJ=");
if (idx !== -1) {
  console.log(content.slice(idx, idx + 500));
} else {
  const idx2 = content.indexOf("function hJ");
  if (idx2 !== -1) {
    console.log(content.slice(idx2, idx2 + 500));
  } else {
    console.log("hJ not found");
  }
}
