const axios = require('axios');
const fs = require('fs');

async function download() {
    try {
        const res = await axios.get('https://www.cricbuzz.com/cricket-match/live-scores', {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });
        fs.writeFileSync('cricbuzz.html', res.data, 'utf-8');
        console.log('Downloaded length:', res.data.length);
    } catch (e) {
        console.log('Failed:', e.message);
    }
}
download();
