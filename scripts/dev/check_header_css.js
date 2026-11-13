const fs = require('fs');

const css = fs.readFileSync('styles/dashboard.css', 'utf8');

const classes = [
  'dashboard-header-container',
  'dashboard-header-wrapper',
  'dashboard-mobile-menu-trigger',
  'dashboard-header-left-titles',
  'tp-account-pill',
  'tp-header-btn'
];

for (const c of classes) {
  let idx = 0;
  while ((idx = css.indexOf(c, idx)) !== -1) {
    const start = Math.max(0, css.lastIndexOf('}', idx) + 1);
    const end = Math.min(css.length, css.indexOf('}', idx) + 1);
    console.log(`/* Match: ${c} */\n${css.substring(start, end).trim()}\n`);
    idx += c.length;
  }
}
