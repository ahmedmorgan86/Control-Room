const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-very-long.js"), "utf8");
// Let's search for "fM" definition in the whole 3D chunk
const chunk = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
const idx = chunk.indexOf("fM=");
if (idx !== -1) {
  console.log(chunk.slice(idx - 50, idx + 2000));
} else {
  // Try function fM
  const idx2 = chunk.indexOf("function fM");
  if (idx2 !== -1) {
    console.log(chunk.slice(idx2, idx2 + 2000));
  } else {
    console.log("fM definition not found");
  }
}
