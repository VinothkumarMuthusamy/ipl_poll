import React, { useState, useEffect } from 'react';
import API from './api';
import './CricketWidget.css';

const CRICKET_API = `${API}/api/cricket`;

export default function CricketWidget() {
  const [liveScores, setLiveScores] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [pointsTable, setPointsTable] = useState([]);
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'completed', 'fixtures', 'standings'

  useEffect(() => {
    fetch(`${CRICKET_API}/live`).then(res => res.json()).then(setLiveScores).catch(console.error);
    fetch(`${CRICKET_API}/completed`).then(res => res.json()).then(setCompletedMatches).catch(console.error);
    fetch(`${CRICKET_API}/fixtures`).then(res => res.json()).then(setFixtures).catch(console.error);
    fetch(`${CRICKET_API}/points-table`).then(res => res.json()).then(setPointsTable).catch(console.error);
  }, []);

  return (
    <div className="cricket-widget">
      <div className="cw-header">
        <h2 className="cw-title"><span className="cw-icon">🏏</span> Cricbuzz Data</h2>
        <div className="cw-tabs">
          <button className={`cw-tab ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>Live</button>
          <button className={`cw-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
          <button className={`cw-tab ${activeTab === 'fixtures' ? 'active' : ''}`} onClick={() => setActiveTab('fixtures')}>Fixtures</button>
          <button className={`cw-tab ${activeTab === 'standings' ? 'active' : ''}`} onClick={() => setActiveTab('standings')}>Standings</button>
        </div>
      </div>

      <div className="cw-content">
        {activeTab === 'live' && (
          <div className="cw-live-list">
            {liveScores.map(match => (
              <div key={match.id} className="cw-card live-card">
                <div className="cw-card-header">
                  <span className="cw-match-title">{match.title}</span>
                  {match.isLive && <span className="cw-badge live-badge">LIVE</span>}
                </div>
                <div className="cw-score-row">
                  <span className="cw-team">{match.team1.name}</span>
                  <span className="cw-score">{match.team1.score} <small>{match.team1.overs}</small></span>
                </div>
                <div className="cw-score-row">
                  <span className="cw-team">{match.team2.name}</span>
                  <span className="cw-score">{match.team2.score} <small>{match.team2.overs}</small></span>
                </div>
                <div className="cw-status">{match.status}</div>
                <div className="cw-highlight">{match.highlight}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="cw-live-list">
            {completedMatches.map(match => (
              <div key={match.id} className="cw-card live-card completed-card">
                <div className="cw-card-header">
                  <span className="cw-match-title">{match.title}</span>
                  <span className="cw-badge" style={{background: '#555'}}>ENDED</span>
                </div>
                <div className="cw-score-row">
                  <span className="cw-team">{match.team1.name}</span>
                  <span className="cw-score">{match.team1.score} <small>{match.team1.overs}</small></span>
                </div>
                <div className="cw-score-row">
                  <span className="cw-team">{match.team2.name}</span>
                  <span className="cw-score">{match.team2.score} <small>{match.team2.overs}</small></span>
                </div>
                <div className="cw-status" style={{color: '#00d2d3'}}>{match.status}</div>
                <div className="cw-highlight" style={{marginTop: '4px', fontStyle: 'italic'}}>{match.date}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="cw-fixtures-list">
            {fixtures.map(match => (
              <div key={match.id} className="cw-card fixture-card">
                <div className="cw-fixture-title">{match.title}</div>
                <div className="cw-fixture-date">📅 {match.date}</div>
                <div className="cw-fixture-venue">📍 {match.venue}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="cw-table-wrapper">
            <table className="cw-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>L</th>
                  <th>Pts</th>
                  <th>NRR</th>
                </tr>
              </thead>
              <tbody>
                {pointsTable.map(row => (
                  <tr key={row.team}>
                    <td>
                      <div className="cw-team-name">
                        <span className="cw-pos">{row.pos}</span>
                        {row.team}
                      </div>
                    </td>
                    <td>{row.p}</td>
                    <td>{row.w}</td>
                    <td>{row.l}</td>
                    <td className="cw-pts">{row.pts}</td>
                    <td>{row.nrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
