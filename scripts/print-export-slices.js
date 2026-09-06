const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "export-default-full.js"), "utf8");
console.log("Length of export-default-full.js:", content.length);
// Let's print out chunks of 4000 chars to find where sidebar/HTML overlay is rendered
for (let i = 4000; i < content.length; i += 4000) {
  console.log(`\n--- Slice ${i} to ${i+4000} ---`);
  console.log(content.slice(i, i + 1000));
}
