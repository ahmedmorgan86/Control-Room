const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "original-chunks");
const files = fs.readdirSync(dir);

console.log("Files in original-chunks:", files);

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), "utf8");
  console.log(`\n=================== ${file} (${content.length} chars) ===================`);

  // Search interesting keywords
  const keywords = ["15054", "12928", "yt-tracking", "terminal-layout", "three", "Three", "canvas", "WebGL", "truck", "Truck", "position", "camera", "orbit", "Scene", "geometry", "material"];
  const found = {};
  for (const kw of keywords) {
    const matches = (content.match(new RegExp(kw, "gi")) || []).length;
    if (matches > 0) found[kw] = matches;
  }
  console.log("Keyword counts:", found);
}
