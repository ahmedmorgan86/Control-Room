const fs = require("fs");
const path = require("path");

// Search across all chunks for "Active Fleet" or "Tracked"
const dir = path.join(__dirname, "original-chunks");
const files = fs.readdirSync(dir);
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  for (const term of ["Active Fleet", "Tracked", "YT Tracker"]) {
    let idx = 0;
    while ((idx = text.indexOf(term, idx)) !== -1) {
      console.log(`Found "${term}" in ${f} at ${idx}:`);
      console.log(text.slice(Math.max(0, idx - 100), idx + 200));
      idx += term.length;
    }
  }
}
