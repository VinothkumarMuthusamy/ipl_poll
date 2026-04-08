const axios = require('axios');

class CricbuzzService {
    constructor() {
        this.cache = {
            data: null,
            time: 0,
            standings: null,
            standingsTime: 0
        };
    }

    async forceFetchCurrentMatches() {
        if (Date.now() - this.cache.time < 60000 && this.cache.data) {
            return this.cache.data;
        }

        const apiKey = process.env.CRICAPI_KEY;
        if (!apiKey) {
            throw new Error('API_KEY_MISSING');
        }

        const res = await axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`);
        if (res.data && res.data.data) {
            // Filter strictly for IPL matches to keep the dashboard clean
            const ipl = res.data.data.filter(m => m.name.toLowerCase().includes('ipl') || m.name.toLowerCase().includes('indian premier league'));
            this.cache.data = ipl;
            this.cache.time = Date.now();
            return ipl;
        }
        return [];
    }

    formatMatches(matches, type) {
        let returnMatches = [];
        matches.forEach((match, i) => {
            const t1 = match.teamInfo && match.teamInfo[0] ? match.teamInfo[0].shortname : "T1";
            const t2 = match.teamInfo && match.teamInfo[1] ? match.teamInfo[1].shortname : "T2";
            
            const score1Obj = match.score && match.score.find(s => s.inning.includes(t1) || s.inning.includes(match.teamInfo[0].name));
            const score2Obj = match.score && match.score.find(s => s.inning.includes(t2) || s.inning.includes(match.teamInfo[1].name));

            const score1 = score1Obj ? `${score1Obj.r}/${score1Obj.w}` : '-';
            const over1 = score1Obj ? `(${score1Obj.o})` : '';
            
            const score2 = score2Obj ? `${score2Obj.r}/${score2Obj.w}` : '-';
            const over2 = score2Obj ? `(${score2Obj.o})` : '';

            // Optional filter based on type
            const isFinished = match.matchEnded || match.status.toLowerCase().includes('won');
            const hasStarted = match.matchStarted;

            if (type === 'live' && (!hasStarted || isFinished)) return;
            if (type === 'completed' && !isFinished) return;
            if (type === 'fixtures' && hasStarted) return;

            returnMatches.push({
                id: match.id || i,
                title: match.name,
                status: match.status || 'Scheduled',
                date: new Date(match.date).toLocaleString(),
                venue: match.venue || 'TBA',
                team1: { name: t1, score: score1, overs: over1 },
                team2: { name: t2, score: score2, overs: over2 },
                isLive: hasStarted && !isFinished,
                highlight: ''
            });
        });

        if (returnMatches.length === 0) {
            returnMatches.push({
                id: 99, 
                title: `No ${type} IPL matches right now.`, 
                status: 'Check the other tabs.', 
                date: '', venue: '',
                team1: {name: '-', score: '-', overs: ''}, 
                team2: {name: '-', score: '-', overs: ''},
                isLive: false, highlight: ''
            });
        }
        return returnMatches.slice(0, 10);
    }

    async getLiveScores() {
        try {
            const data = await this.forceFetchCurrentMatches();
            return this.formatMatches(data, 'live');
        } catch (e) {
            return this.getErrorState(e);
        }
    }

    async getCompleted() {
        try {
            const data = await this.forceFetchCurrentMatches();
            return this.formatMatches(data, 'completed');
        } catch (e) {
            return this.getErrorState(e);
        }
    }

    async getFixtures() {
        const apiKey = process.env.CRICAPI_KEY;
        if (!apiKey) return this.getErrorState({message: 'API_KEY_MISSING'});
        
        try {
            // Must use /v1/matches instead of currentMatches to get future fixtures
            if (!this.cache.fixtures || Date.now() - this.cache.fixtureTime > 1800000) {
                const data = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${apiKey}&offset=0`);
                this.cache.fixtures = data.data.data || [];
                this.cache.fixtureTime = Date.now();
            }
            return this.formatMatches(this.cache.fixtures, 'fixtures');
        } catch (e) {
            return this.getErrorState(e);
        }
    }

    async getPointsTable() {
        const apiKey = process.env.CRICAPI_KEY;
        if (!apiKey) return [{ pos: '-', team: 'Requires API Key', p: 0, w: 0, l: 0, pts: 0, nrr: '0.00' }];

        // Cache standings for 1 hour to prevent API rate limiting
        if (Date.now() - this.cache.standingsTime < 3600000 && this.cache.standings) {
            return this.cache.standings;
        }

        try {
            // Because CricAPI paywalls their series_standings endpoint, we will mathematically calculate the point table
            // using the open fixtures endpoint which holds the historic game statuses!
            let allMatches = [];
            for(let offset = 0; offset <= 50; offset += 25) {
                const mRes = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${apiKey}&offset=${offset}`);
                if(mRes.data && mRes.data.data) {
                    const ipl = mRes.data.data.filter(m => 
                        (m.name.toLowerCase().includes('ipl') || m.name.toLowerCase().includes('t20')) &&
                        m.date.includes('2026') &&
                        !m.name.toLowerCase().includes('women') &&
                        !m.name.toLowerCase().includes('wpl')
                    );
                    allMatches.push(...ipl);
                }
            }

            let teams = {
                'CSK': { team: 'Chennai Super Kings (CSK)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'MI': { team: 'Mumbai Indians (MI)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'RCB': { team: 'Royal Challengers Bengaluru (RCB)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'KKR': { team: 'Kolkata Knight Riders (KKR)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'RR': { team: 'Rajasthan Royals (RR)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'SRH': { team: 'Sunrisers Hyderabad (SRH)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'DC': { team: 'Delhi Capitals (DC)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'PBKS': { team: 'Punjab Kings (PBKS)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'GT': { team: 'Gujarat Titans (GT)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' },
                'LSG': { team: 'Lucknow Super Giants (LSG)', p: 0, w: 0, l: 0, pts: 0, nrr: '+0.00' }
            };

            allMatches.forEach(m => {
                if(!m.teamInfo || m.teamInfo.length < 2) return;
                
                // CricAPI usually uses shortname like "CSK" or full name
                const t1 = Object.keys(teams).find(k => m.teamInfo[0].name.includes(k) || (m.teamInfo[0].shortname && teams[k].team.includes(m.teamInfo[0].shortname))) || 'Unknown';
                const t2 = Object.keys(teams).find(k => m.teamInfo[1].name.includes(k) || (m.teamInfo[1].shortname && teams[k].team.includes(m.teamInfo[1].shortname))) || 'Unknown';
                
                if (t1 !== 'Unknown' && t2 !== 'Unknown' && m.matchEnded && m.status && m.status.toLowerCase() !== 'match not started') {
                     teams[t1].p++;
                     teams[t2].p++;
                     if(m.status.includes(m.teamInfo[0].name) || m.status.includes(t1) || m.status.includes('won by') && m.status.startsWith(t1)) {
                         teams[t1].w++;
                         teams[t1].pts += 2;
                         teams[t2].l++;
                     } else if (m.status.includes(m.teamInfo[1].name) || m.status.includes(t2) || m.status.includes('won by') && m.status.startsWith(t2)) {
                         teams[t2].w++;
                         teams[t2].pts += 2;
                         teams[t1].l++;
                     }
                }
            });

            if (Object.keys(teams).length === 0) {
                 return [{ pos: '-', team: 'Waiting on historic fixtures to calculate...', p: 0, w: 0, l: 0, pts: 0, nrr: '0.00' }];
            }
            
            let table = Object.values(teams).sort((a,b) => b.pts - a.pts).map((t, i) => ({
                pos: i + 1,
                team: t.team,
                p: t.p,
                w: t.w,
                l: t.l,
                pts: t.pts,
                nrr: t.nrr
            }));

            this.cache.standings = table;
            this.cache.standingsTime = Date.now();
            return table;

        } catch (e) {
            return [{ pos: '-', team: 'Error calculating standings', p: 0, w: 0, l: 0, pts: 0, nrr: '0.00' }];
        }
    }

    getErrorState(error) {
        if (error.message === 'API_KEY_MISSING') {
            return [{
                id: 1, title: 'CRICAPI_KEY missing in .env', status: 'Please get a free API key from cricapi.com',
                team1: {name: 'ERR', score: '-'}, team2: {name: 'ERR', score: '-'}, isLive: false, highlight: 'Go to cricapi.com -> Sign Up -> get API Key', date: '', venue: ''
            }];
        }
        return [{
            id: 1, title: 'Network Error', status: error.message,
            team1: {name: 'ERR', score: '-'}, team2: {name: 'ERR', score: '-'}, isLive: false, highlight: '', date: '', venue: ''
        }];
    }
}

module.exports = new CricbuzzService();
