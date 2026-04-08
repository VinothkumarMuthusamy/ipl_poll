const axios = require('axios');
const API_KEY = 'ba4789ec-1fb5-4f9a-89ab-c8f857fbb317';

async function test() {
    try {
        const mRes = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${API_KEY}&offset=0`);
        const matches = mRes.data.data || [];
        const iplMatches = matches.filter(m => m.name.toLowerCase().includes('ipl') || m.name.toLowerCase().includes('premier league') || m.name.toLowerCase().includes('t20'));
        
        if (iplMatches.length > 0) {
            console.log("Found match:", iplMatches[0].name);
            console.log("Series ID:", iplMatches[0].series_id);
            
            // Now test fetching standings
            const standingsRes = await axios.get(`https://api.cricapi.com/v1/series_standings?apikey=${API_KEY}&seriesId=${iplMatches[0].series_id}`);
            console.log("Standings:", standingsRes.data.data ? standingsRes.data.data.length : "NO DATA");
            if (standingsRes.data.data && standingsRes.data.data.length > 0) {
                console.log(standingsRes.data.data[0].standings.slice(0, 2));
            }
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
