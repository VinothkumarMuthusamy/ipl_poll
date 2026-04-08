const axios = require('axios');
const API_KEY = 'ba4789ec-1fb5-4f9a-89ab-c8f857fbb317';

async function test() {
    try {
        console.log("Fetching series...");
        const res = await axios.get(`https://api.cricapi.com/v1/series?apikey=${API_KEY}&offset=0`);
        const series = res.data.data;
        const iplSeries = series.filter(s => s.name.toLowerCase().includes('ipl') || s.name.toLowerCase().includes('premier league'));
        console.log("\nIPL Series Found:", iplSeries.slice(0, 3));
        
        console.log("\nFetching matches...");
        const mRes = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${API_KEY}&offset=0`);
        const matches = mRes.data.data || [];
        const iplMatches = matches.filter(m => m.name.toLowerCase().includes('ipl') || m.name.toLowerCase().includes('premier league') || m.name.toLowerCase().includes('super kings'));
        console.log("\nIPL Matches Found:", iplMatches.length);
        if (iplMatches.length > 0) {
            console.log(iplMatches[0].name, iplMatches[0].date);
        }

    } catch (e) {
        console.log("Error:", e.message);
        if (e.response && e.response.data) console.log(e.response.data);
    }
}
test();
