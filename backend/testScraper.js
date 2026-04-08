const axios = require('axios');
const cheerio = require('cheerio');

async function testFetch() {
    try {
        const response = await axios.get('https://www.cricbuzz.com/cricket-match/live-scores');
        const $ = cheerio.load(response.data);
        console.log('Title:', $('title').text());
        
        let matches = [];
        $('.cb-mtch-lst.cb-col.cb-col-100.cb-tms-itm').each((i, el) => {
            if (i > 5) return;
            const matchTitle = $(el).find('.cb-lv-scrs-well-sp').text().trim() || $(el).find('h3').text().trim();
            const score = $(el).find('.cb-lv-scrs-col').text().trim();
            const status = $(el).find('.cb-text-live, .cb-text-complete, .cb-text-preview').text().trim();
            matches.push({ title: matchTitle, score, status });
        });
        console.log('Matches:', matches);

        // Also let's try the XML feed just in case
        const xml = await axios.get('http://synd.cricbuzz.com/j2me/1.0/livematches.xml');
        console.log('XML feed length:', xml.data.length);
    } catch (e) {
        console.error('Error fetching data', e.message);
    }
}
testFetch();
