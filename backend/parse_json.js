const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('cricbuzz.html', 'utf-8');
const $ = cheerio.load(html);

let matches = [];
$('a[href^="/live-cricket-scores"]').each((i, el) => {
    if (i >= 5) return;
    const parent = $(el).parent();
    
    // Title is usually inside the anchor tag
    const title = $(el).attr('title');
    
    // We can just dump all the text inside the block and split it by double spaces or newlines
    const rawText = parent.text().replace(/\s+/g, ' ').trim();
    
    matches.push({ title, rawText });
});

fs.writeFileSync('matches_parsed.json', JSON.stringify(matches, null, 2));
