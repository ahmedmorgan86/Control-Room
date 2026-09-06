const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "fu-full.js"), "utf8");
let idx = 0;
while ((idx = content.indexOf("truck", idx)) !== -1) {
  console.log(`--- Match at ${idx} ---`);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  idx += 5;
  if (idx > 5000) break;
}
