const http = require("http");
const fs = require("fs");
const path = require("path");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  const url = "http://172.16.20.249:3000/_next/static/chunks/0-3_ksb13w76o.js";
  const content = fs.readFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), "utf8");
  
  // Let's find where dynamic import or loadable modules are defined in 0-3_ksb13w76o.js
  console.log("Searching in 0-3_ksb13w76o.js for modules...");
  
  // Let's search for truck model or truck mesh or boxGeometry
  const idx = content.indexOf("boxGeometry");
  console.log("boxGeometry index:", idx);
  if (idx !== -1) {
    console.log(content.slice(Math.max(0, idx - 500), idx + 1000));
  }
}

main();
