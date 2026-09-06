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

const scripts = [
  '/_next/static/chunks/0.azsmtk629to.js',
  '/_next/static/chunks/0n~dq4kpx9xxx.js',
  '/_next/static/chunks/turbopack-0s4tvgctk6vrc.js',
  '/_next/static/chunks/07778i3xq5qya.js',
  '/_next/static/chunks/0dbhjjzl8qfwv.js',
  '/_next/static/chunks/0jxhf8pki69b3.js',
  '/_next/static/chunks/0ysf377awgbyb.js',
  '/_next/static/chunks/03~yq9q893hmn.js',
  '/_next/static/chunks/0fpki3y6aj230.js'
];

async function main() {
  const dir = path.join(__dirname, "original-chunks");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const s of scripts) {
    const filename = path.basename(s);
    const url = `http://172.16.20.249:3000${s}`;
    console.log(`Downloading ${url}...`);
    try {
      const res = await fetchUrl(url);
      console.log(` -> ${filename}: status ${res.status}, length ${res.data.length}`);
      fs.writeFileSync(path.join(dir, filename), res.data);
    } catch (e) {
      console.error(` -> Failed: ${e.message}`);
    }
  }

  // Also check if there are other chunks by searching module IDs in 0ysf377awgbyb.js or turbopack
  console.log("Done downloading base chunks!");
}

main();
