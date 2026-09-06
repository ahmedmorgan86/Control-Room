const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");

// Search for module 45649 definition
const modRegex = /45649,\s*([a-zA-Z0-9_]+)\s*=>/g;
let m = modRegex.exec(content);
if (m) {
  console.log(`Module 45649 found at ${m.index}`);
  const snippet = content.slice(m.index, m.index + 8000);
  console.log("Snippet:\n", snippet);
  fs.writeFileSync(path.join(__dirname, "module-45649.js"), content.slice(m.index, m.index + 50000));
  console.log("Saved snippet to module-45649.js");
} else {
  console.log("Module 45649 not found with standard pattern, searching index of 45649:");
  let idx = 0;
  while ((idx = content.indexOf("45649", idx)) !== -1) {
    console.log(`Match at ${idx}:`, content.slice(Math.max(0, idx - 50), idx + 150));
    idx += 5;
  }
}
