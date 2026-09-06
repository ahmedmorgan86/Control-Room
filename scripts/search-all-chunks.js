const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's search for sidebar in 0-3_ksb13w76o.js or anywhere else in chunks
// Let's search for "positions" or "truckId" or "Active Fleet" across all original-chunks
const dir = path.join(__dirname, "original-chunks");
const files = fs.readdirSync(dir);
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  if (text.includes("Active Fleet") || text.includes("truckId") || text.includes("YT #")) {
    console.log(`Found in ${f}:`);
    let idx = 0;
    while ((idx = text.indexOf("truckId", idx)) !== -1) {
      console.log(text.slice(Math.max(0, idx - 100), idx + 200));
      idx += 10;
      if (idx > 1000) break;
    }
  }
}
