const axios = require('axios');
const cheerio = require('cheerio');

async function testFetch() {
    try {
        const response = await axios.get('https://www.cricbuzz.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        
        let matches = [];
        $('.cb-mtch-lst').each((i, el) => {
            if (i >= 5) return;
            const teams = $(el).find('.cb-hm-scg-blk').text().trim(); // This includes scores
            const status = $(el).find('.cb-text-complete, .cb-text-live').text().trim();
            const link = $(el).find('a').attr('href');
            matches.push({ title: teams, status, link });
        });
        console.log(JSON.stringify(matches, null, 2));
    } catch (e) {
        console.error('Error fetching data', e.message);
    }
}
testFetch();
