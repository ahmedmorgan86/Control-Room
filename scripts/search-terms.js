const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for "Active" or "Fleet" or "track" or "sidebar" in all chunks
const dir = path.join(__dirname, "original-chunks");
const files = fs.readdirSync(dir);
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  for (const term of ["Active", "Fleet", "Tracked", "driverName", "latitude", "longitude"]) {
    if (text.includes(term)) {
      console.log(`Found "${term}" in ${f}`);
    }
  }
}
