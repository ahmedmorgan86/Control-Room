const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
// Let's print out the exact layout of the 3D YT Tracker component from export-default.js / fu-render.js
console.log(content.slice(1150000, 1154075));
