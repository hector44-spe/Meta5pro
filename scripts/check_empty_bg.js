const fs = require('fs');

const css = fs.readFileSync('styles/dashboard.css', 'utf8');

const queries = ['table tbody', 'tbody tr', 'table tr', 'HistoryTable', '.table_wrapper table'];
for (const q of queries) {
  let idx = 0;
  while ((idx = css.indexOf(q, idx)) !== -1) {
    const start = Math.max(0, css.lastIndexOf('}', idx) + 1);
    const end = Math.min(css.length, css.indexOf('}', idx) + 1);
    console.log(`[dashboard.css match for ${q}]`);
    console.log(css.substring(start, end).trim());
    idx += q.length;
  }
}
