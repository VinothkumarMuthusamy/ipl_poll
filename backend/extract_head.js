const fs = require('fs');
const html = fs.readFileSync('cricbuzz.html', 'utf-8');

console.log(html.substring(0, 1000));
