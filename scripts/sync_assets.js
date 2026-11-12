const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Projects/Meta Gold 5 COLD STORAGE PAGE_files';
const targetDir = 'public/cold_storage_files';
const dashboardDir = 'public/dashboard_files';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
let copiedCold = 0;
let copiedDash = 0;

for (const file of files) {
    const srcFile = path.join(srcDir, file);
    if (fs.statSync(srcFile).isFile()) {
        const destCold = path.join(targetDir, file);
        fs.copyFileSync(srcFile, destCold);
        copiedCold++;

        const destDash = path.join(dashboardDir, file);
        if (!fs.existsSync(destDash)) {
            fs.copyFileSync(srcFile, destDash);
            copiedDash++;
        }
    }
}

console.log(`Copied ${copiedCold} files to ${targetDir}, and ${copiedDash} new files to ${dashboardDir}`);
