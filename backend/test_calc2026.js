const axios = require('axios');
const API_KEY = 'ba4789ec-1fb5-4f9a-89ab-c8f857fbb317';

async function testCalc2026() {
    let allMatches = [];
    try {
        for(let offset = 0; offset <= 75; offset += 25) {
            const mRes = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${API_KEY}&offset=${offset}`);
            if(mRes.data && mRes.data.data) {
                // strict filter for IPL 2026 matches only
                const ipl = mRes.data.data.filter(m => 
                    (m.name.toLowerCase().includes('ipl') || m.name.toLowerCase().includes('indian premier')) 
                    && m.date.includes('2026')
                    && !m.name.toLowerCase().includes('women')
                    && !m.name.toLowerCase().includes('wpl')
                );
                allMatches.push(...ipl);
            }
        }
        
        console.log("Total 2026 IPL Matches fetched:", allMatches.length);
        let teams = {};
        allMatches.forEach(m => {
            if(!m.teamInfo || m.teamInfo.length < 2) return;
            const t1 = m.teamInfo[0].shortname || m.teamInfo[0].name;
            const t2 = m.teamInfo[1].shortname || m.teamInfo[1].name;
            
            if(!teams[t1]) teams[t1] = { team: m.teamInfo[0].name, p: 0, w: 0, l: 0, pts: 0 };
            if(!teams[t2]) teams[t2] = { team: m.teamInfo[1].name, p: 0, w: 0, l: 0, pts: 0 };
            
            if(m.matchEnded && m.status && m.status.toLowerCase() !== 'match not started') {
                 teams[t1].p++;
                 teams[t2].p++;
                 if(m.status.includes(m.teamInfo[0].name) || m.status.includes(t1)) {
                     teams[t1].w++;
                     teams[t1].pts += 2;
                     teams[t2].l++;
                 } else if (m.status.includes(m.teamInfo[1].name) || m.status.includes(t2)) {
                     teams[t2].w++;
                     teams[t2].pts += 2;
                     teams[t1].l++;
                 }
            }
        });
        
        let table = Object.values(teams).sort((a,b) => b.pts - a.pts);
        console.log(table);
    } catch (e) {
        console.log("Error:", e.message);
    }
}
testCalc2026();
