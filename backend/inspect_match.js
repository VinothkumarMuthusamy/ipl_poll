const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('cricbuzz.html', 'utf-8');
const $ = cheerio.load(html);

const firstMatch = $('a[href^="/live-cricket-scores"]').first().parent().html();
console.log(firstMatch);
