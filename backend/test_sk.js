const axios = require('axios');
const cheerio = require('cheerio');

async function testSkTable() {
    try {
        const res = await axios.get('https://www.sportskeeda.com/go/ipl/points-table', {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(res.data);
        let table = [];
        $('.sk-points-table-body tr').each((i, el) => {
            const tds = $(el).find('td');
            if(tds.length >= 7) {
                 table.push({
                     team: $(tds[1]).text().replace(/\n/g, '').trim(),
                     p: $(tds[2]).text().trim(),
                     w: $(tds[3]).text().trim(),
                     l: $(tds[4]).text().trim(),
                     pts: $(tds[6]).text().trim(),
                     nrr: $(tds[7]).text().trim()
                 });
            }
        });
        console.log(table);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
testSkTable();
