const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");

// Extract the component starting around index 1148200 to the end or next export
const snippet = content.slice(1148200, 1154000);
console.log(snippet);

fs.writeFileSync(path.join(__dirname, "yt-tracker-decompiled.js"), snippet);
console.log("Saved yt-tracker-decompiled.js");
