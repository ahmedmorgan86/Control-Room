const fs = require("fs");
const path = require("path");

const srcDir = "E:\\Morgan VIP\\Control Room\\app\\Control Room";
const destDir = "E:\\Morgan VIP\\Control Room\\app\\TerminalMonitorClean";

console.log("Creating clean directory:", destDir);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const itemsToCopy = [
  "src",
  "public",
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
  ".env.local"
];

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

for (const item of itemsToCopy) {
  const sPath = path.join(srcDir, item);
  const dPath = path.join(destDir, item);
  if (fs.existsSync(sPath)) {
    console.log(`Copying ${item}...`);
    copyRecursive(sPath, dPath);
  } else {
    console.log(`Skipping ${item} (not found)`);
  }
}

console.log("Scaffolding complete!");
