const fs = require('fs');

const shell = fs.readFileSync('components/DashboardShell.tsx', 'utf8');
const lines = shell.split('\n');
lines.forEach((l, i) => {
  if (l.includes('$0.00') || l.includes('0.00')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
