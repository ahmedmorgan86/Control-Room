const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "export-default-full.js"), "utf8");
// Let's search for the sidebar in the exported 3D chunk component
const idx = content.indexOf("Active Fleet");
if (idx !== -1) {
  console.log("Found Active Fleet at", idx);
  console.log(content.slice(Math.max(0, idx - 500), idx + 1000));
} else {
  console.log("Active Fleet not found in 3D chunk. Let's search for sidebar or list of trucks:");
  let i = 0;
  while ((i = content.indexOf("truckId", i)) !== -1) {
    console.log(content.slice(Math.max(0, i - 100), i + 200));
    i += 10;
    if (i > 5000) break;
  }
}
