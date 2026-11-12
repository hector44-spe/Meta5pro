const fs = require('fs');
const js = fs.readFileSync('C:/Projects/Meta Gold 5 COLD STORAGE PAGE_files/index-1tHIvi09.js.download', 'utf8');

const terms = ['How it works', 'Cold storage', 'cold-storage', 'Add crypto', 'Your assets', 'Select asset', 'Cold Storage Value'];
for (const t of terms) {
    let count = 0;
    let idx = 0;
    while ((idx = js.indexOf(t, idx)) !== -1) {
        count++;
        const snippet = js.substring(Math.max(0, idx - 100), Math.min(js.length, idx + 250));
        console.log(`=== Match for "${t}" at index ${idx} ===`);
        console.log(snippet.replace(/\n/g, ' '));
        idx += t.length;
        if (count >= 2) break;
    }
}
