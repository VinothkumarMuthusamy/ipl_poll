const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeTable() {
    try {
        const res = await axios.get('https://www.ndtv.com/sports/cricket/ipl/points-table');
        const $ = cheerio.load(res.data);
        
        const table = [];
        $('.points_table_wrap table tbody tr').each((i, el) => {
             const tds = $(el).find('td');
             if(tds.length >= 7) {
                 table.push({
                     team: $(tds[1]).text().trim(),
                     p: $(tds[2]).text().trim(),
                     w: $(tds[3]).text().trim(),
                     l: $(tds[4]).text().trim(),
                     pts: $(tds[6]).text().trim(),
                     nrr: $(tds[7]).text().trim()
                 });
             }
        });
        console.log(table);
    } catch(e) { console.log(e.message); }
}
scrapeTable();
