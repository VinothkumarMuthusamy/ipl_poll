const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('cricbuzz.html', 'utf-8');
const $ = cheerio.load(html);
const text = $('body').text();
const matches = text.match(/IND|AUS|ENG|SA|NZ|PAK|SL|BAN|WI|AFG|RCB|CSK|MI|KKR|SRH|DC|PBKS|RR|LSG|GT/g);
console.log('Found teams:', new Set(matches));
