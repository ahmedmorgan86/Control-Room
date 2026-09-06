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
  console.log("Fetching", url);
  try {
    const res = await fetchUrl(url);
    console.log("Status:", res.status);
    console.log("Length:", res.data.length);
    fs.writeFileSync(path.join(__dirname, "original-chunks", "0-3_ksb13w76o.js"), res.data);
    console.log("Saved 0-3_ksb13w76o.js!");
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

main();
