import { useState, useEffect } from "react";
import "./PollCard.css";
import API from "./config";

const IPL_COLORS = {
  "Chennai Super Kings": { bg: "#f5c518", text: "#1a0a00" },
  "CSK": { bg: "#f5c518", text: "#1a0a00" },
  "Mumbai Indians": { bg: "#004ba0", text: "#ffffff" },
  "MI": { bg: "#004ba0", text: "#ffffff" },
  "Royal Challengers Bangalore": { bg: "#c8102e", text: "#ffffff" },
  "RCB": { bg: "#c8102e", text: "#ffffff" },
  "Kolkata Knight Riders": { bg: "#3a225d", text: "#f5c518" },
  "KKR": { bg: "#3a225d", text: "#f5c518" },
  "Delhi Capitals": { bg: "#00579d", text: "#d71920" },
  "DC": { bg: "#00579d", text: "#d71920" },
  "Punjab Kings": { bg: "#d71920", text: "#ffffff" },
  "PBKS": { bg: "#d71920", text: "#ffffff" },
  "Rajasthan Royals": { bg: "#ea1a8d", text: "#ffffff" },
  "RR": { bg: "#ea1a8d", text: "#ffffff" },
  "Sunrisers Hyderabad": { bg: "#f26522", text: "#ffffff" },
  "SRH": { bg: "#f26522", text: "#ffffff" },
  "Gujarat Titans": { bg: "#1b2133", text: "#9dc3e6" },
  "GT": { bg: "#1b2133", text: "#9dc3e6" },
  "Lucknow Super Giants": { bg: "#a72b2a", text: "#fbdb18" },
  "LSG": { bg: "#a72b2a", text: "#fbdb18" },
};

function getTeamStyle(name) {
  return IPL_COLORS[name] || { bg: "#1e2a3a", text: "#94a3b8" };
}

function formatExpiry(endTime) {
  const diff = endTime - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function PollCard({ poll, mobile, votedOption, onVote, onEdit, onDelete }) {
  const [voters, setVoters] = useState({ voters1: [], voters2: [] });
  const now = Date.now();
  const expired = now > poll.end_time;
  const total = poll.votes1 + poll.votes2;
  const pct1 = total === 0 ? 50 : Math.round((poll.votes1 / total) * 100);
  const pct2 = 100 - pct1;
  const isOwner = poll.created_by === mobile;
  const timeLeft = formatExpiry(poll.end_time);

  const style1 = getTeamStyle(poll.option1);
  const style2 = getTeamStyle(poll.option2);

  const winnerOpt = total > 0 ? (poll.votes1 > poll.votes2 ? 1 : poll.votes2 > poll.votes1 ? 2 : 0) : 0;

  useEffect(() => {
    if (expired) {
      fetch(`${API}/polls/${poll.id}/voters`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setVoters({ voters1: data.voters1, voters2: data.voters2 });
          }
        })
        .catch((err) => console.error("Error fetching voters:", err));
    }
  }, [expired, poll.id]);

  return (
    <div className={`poll-card ${expired ? "expired" : "live"} ${votedOption ? "voted" : ""}`}>
      {/* Header */}
      <div className="pc-header">
        <div className="pc-header-left">
          <span className={`badge ${expired ? "badge-closed" : "badge-live"}`}>
            {expired ? "Closed" : "Live"}
          </span>
          {isOwner && <span className="owner-badge">👑 You</span>}
        </div>
        {timeLeft && !expired && <span className="time-left">⏱ {timeLeft}</span>}
      </div>

      {/* Match name */}
      <h3 className="pc-match">{poll.match_name}</h3>
      {poll.match_date && <p className="pc-date">📅 {poll.match_date}</p>}

      {/* VS Row */}
      <div className="pc-vs-row">
        <div className="pc-team" style={{ background: style1.bg, color: style1.text }}>
          {poll.option1}
        </div>
        <div className="vs-badge">VS</div>
        <div className="pc-team" style={{ background: style2.bg, color: style2.text }}>
          {poll.option2}
        </div>
      </div>

      {/* Vote buttons */}
      {!votedOption && !expired && (
        <div className="pc-vote-row">
          <button className="vote-btn vote-btn-1" onClick={() => onVote(poll.id, 1)}>
            Vote {poll.option1.split(" ").pop()}
          </button>
          <button className="vote-btn vote-btn-2" onClick={() => onVote(poll.id, 2)}>
            Vote {poll.option2.split(" ").pop()}
          </button>
        </div>
      )}

      {/* Result bars (shown after voting or if expired) */}
      {(votedOption || expired) && (
        <div className="pc-results">
          <div className={`result-row ${winnerOpt === 1 && expired ? "winner" : ""}`}>
            <div className="result-label">
              {winnerOpt === 1 && expired && <span className="win-crown">🏆 </span>}
              {poll.option1}
              {votedOption === 1 && <span className="your-vote"> ← Your vote</span>}
            </div>
            <div className="result-bar-wrap">
              <div className="result-bar bar-1" style={{ width: `${pct1}%` }} />
            </div>
            <div className="result-pct">{pct1}% <span>({poll.votes1})</span></div>
            {expired && voters.voters1.length > 0 && (
              <div className="voters-list">
                <span className="voters-label">Votes:</span> {voters.voters1.join(", ")}
              </div>
            )}
          </div>

          <div className={`result-row ${winnerOpt === 2 && expired ? "winner" : ""}`}>
            <div className="result-label">
              {winnerOpt === 2 && expired && <span className="win-crown">🏆 </span>}
              {poll.option2}
              {votedOption === 2 && <span className="your-vote"> ← Your vote</span>}
            </div>
            <div className="result-bar-wrap">
              <div className="result-bar bar-2" style={{ width: `${pct2}%` }} />
            </div>
            <div className="result-pct">{pct2}% <span>({poll.votes2})</span></div>
            {expired && voters.voters2.length > 0 && (
              <div className="voters-list">
                <span className="voters-label">Votes:</span> {voters.voters2.join(", ")}
              </div>
            )}
          </div>

          <p className="total-votes">{total} vote{total !== 1 ? "s" : ""} cast</p>
        </div>
      )}

      {/* Owner actions */}
      {isOwner && (
        <div className="pc-actions">
          {!expired && (
            <button className="btn btn-ghost btn-sm" onClick={onEdit}>
              ✏️ Edit
            </button>
          )}
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}
