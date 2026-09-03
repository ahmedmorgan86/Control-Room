const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '0-3_ksb13w76o.js');
const content = fs.readFileSync(file, 'utf8');

const target = content.indexOf('YT Tracker');
if (target !== -1) {
  console.log(content.substring(target - 100, target + 1500));
}
