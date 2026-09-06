const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for pH, pW, fA, fv helper functions
for (const fn of ["pH", "pW", "fA", "fv"]) {
  const i = content.indexOf(`function ${fn}(`);
  if (i !== -1) {
    console.log(`--- ${fn} ---`);
    console.log(content.slice(i, i + 400));
  }
}
