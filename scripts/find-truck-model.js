const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for fr and fs definitions (truck mesh and label)
const idxFr = content.indexOf("function fr(");
if (idxFr !== -1) {
  console.log("--- fr ---");
  console.log(content.slice(idxFr, idxFr + 1500));
}
const idxFs = content.indexOf("function fs(");
if (idxFs !== -1) {
  console.log("--- fs ---");
  console.log(content.slice(idxFs, idxFs + 1500));
}
