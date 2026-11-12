const fs = require('fs');
const js = fs.readFileSync('scratch/cold_storage_page_source.js', 'utf8');

fs.writeFileSync('scratch/cold_storage_asset_view.js', js.substring(15000, 30000));
console.log('Wrote scratch/cold_storage_asset_view.js');
