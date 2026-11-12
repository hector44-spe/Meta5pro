const fs = require('fs');
const js = fs.readFileSync('C:/Projects/Meta Gold 5 COLD STORAGE PAGE_files/index-1tHIvi09.js.download', 'utf8');

const start = 5885000;
const end = 5905000;
fs.writeFileSync('scratch/cold_storage_main_tab_components.js', js.substring(start, end));
console.log('Wrote scratch/cold_storage_main_tab_components.js');
