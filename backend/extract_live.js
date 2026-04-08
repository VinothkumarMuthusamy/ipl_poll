const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('cricbuzz.html', 'utf-8');
const $ = cheerio.load(html);

// Find match boxes. Cricbuzz often uses 'cb-col' and 'cb-col-100' or similar for match cards.
// But we can also look for elements with 'ng-show' or 'text-bold' or just search anchor tags with '/live-cricket-scores'
let matches = [];
$('a[href^="/live-cricket-scores"]').parent().each((i, el) => {
    if (i >= 5) return;
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text.length > 10) {
        matches.push(text);
    }
});

console.log('Matches from A tags:', matches);

// Check another common class for list items
let listItems = [];
$('.cb-col-100.cb-col.cb-schdl').each((i, el) => {
    if (i >= 3) return;
    listItems.push($(el).text().trim().replace(/\s+/g, ' '));
});
console.log('Matches from cb-schdl:', listItems);
