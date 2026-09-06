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
  try {
    console.log("Fetching index html from http://172.16.20.249:3000/ ...");
    const res = await fetchUrl("http://172.16.20.249:3000/");
    console.log("Status:", res.status);
    console.log("HTML length:", res.data.length);
    
    // Find all script tags
    const scriptRegex = /src="([^"]+)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(res.data)) !== null) {
      scripts.push(match[1]);
    }
    console.log("\nFound scripts in HTML:", scripts);

    // Also check for build manifest or chunk files
    const manifestUrls = [
      "http://172.16.20.249:3000/_next/static/development/_buildManifest.js",
      "http://172.16.20.249:3000/_next/static/development/_ssgManifest.js",
    ];

    // Check webpack chunks
    const chunkNames = [
      "12928.js",
      "15054.js",
      "app/page.js",
    ];
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
