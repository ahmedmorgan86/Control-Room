const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
console.log("Chunk length:", content.length);

// Search for module 12928 or component exports
const idx = content.indexOf("12928");
console.log("Found 12928 at index:", idx);

// Find where 12928 is defined
const modRegex = /12928,\s*([a-zA-Z0-9_]+)\s*=>/g;
let m;
while ((m = modRegex.exec(content)) !== null) {
  console.log(`Module 12928 found at ${m.index}`);
  const snippet = content.slice(m.index, m.index + 2000);
  console.log("Snippet:", snippet);
}

// Also check what libraries are in this chunk (three, fiber, etc.)
const libs = ["three", "Canvas", "OrbitControls", "react-three", "fetch", "/api/", "terminal"];
for (const lib of libs) {
  const matches = (content.match(new RegExp(lib, "gi")) || []).length;
  console.log(`Keyword "${lib}": ${matches} matches`);
}
