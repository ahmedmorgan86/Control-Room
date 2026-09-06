const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for fv definition (geometry factory for buildings, blocks, areas)
const idx = content.indexOf("function fv(");
if (idx !== -1) {
  console.log("--- fv ---");
  console.log(content.slice(idx, idx + 1200));
}

// Let's search for p8, p9, p7, pY, p6, fI, fR, fP, fe definitions
for (const fn of ["p8", "p9", "p7", "pY", "p6", "fI", "fR", "fP", "fe"]) {
  const i = content.indexOf(`function ${fn}(`);
  if (i !== -1) {
    console.log(`--- ${fn} ---`);
    console.log(content.slice(i, i + 600));
  }
}
