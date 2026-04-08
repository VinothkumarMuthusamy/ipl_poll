import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast, ToastContainer } from "./useToast";
import PollCard from "./PollCard";
import CreatePollModal from "./CreatePollModal";
import EditPollModal from "./EditPollModal";
import CricketWidget from "./CricketWidget";
import API from "./api";
import "./Dashboard.css";

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [votedMap, setVotedMap] = useState({});   // { poll_id: option }
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");    // "all" | "open" | "closed" | "mine"
  const [showCreate, setShowCreate] = useState(false);
  const [editPoll, setEditPoll] = useState(null);

  const mobile = localStorage.getItem("mobile");
  const name   = localStorage.getItem("name");
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();

  /* ── Fetch polls ──────────────────────────────────── */
  const loadPolls = useCallback(async () => {
    try {
      const res = await fetch(`${API}/polls`);
      const data = await res.json();
      setPolls(data);

      // check voted status for each poll
      const map = {};
      await Promise.all(
        data.map(async (p) => {
          try {
            const r = await fetch(`${API}/voted/${p.id}/${mobile}`);
            const v = await r.json();
            if (v.voted) map[p.id] = v.option;
          } catch {}
        })
      );
      setVotedMap(map);
    } catch {
      showToast("Could not load polls. Is the backend running?", "error");
    }
    setLoading(false);
  }, [mobile, showToast]);

  useEffect(() => { loadPolls(); }, [loadPolls]);

  /* ── Vote ─────────────────────────────────────────── */
  const handleVote = async (pollId, option) => {
    if (votedMap[pollId]) return showToast("You've already voted!", "error");
    try {
      const res = await fetch(`${API}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: pollId, mobile, option }),
      });
      const data = await res.json();
      if (data.success) {
        setVotedMap((m) => ({ ...m, [pollId]: option }));
        setPolls((prev) =>
          prev.map((p) =>
            p.id === pollId
              ? { ...p, votes1: option === 1 ? p.votes1 + 1 : p.votes1, votes2: option === 2 ? p.votes2 + 1 : p.votes2 }
              : p
          )
        );
        showToast("Vote recorded! 🎉", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Vote failed. Try again.", "error");
    }
  };

  /* ── Delete poll ──────────────────────────────────── */
  const handleDelete = async (pollId) => {
    if (!window.confirm("Delete this poll?")) return;
    try {
      const res = await fetch(`${API}/delete-poll/${pollId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (data.success) {
        setPolls((p) => p.filter((x) => x.id !== pollId));
        showToast("Poll deleted.", "info");
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  /* ── Logout ───────────────────────────────────────── */
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ── Filter polls ─────────────────────────────────── */
  const now = Date.now();
  const filtered = polls.filter((p) => {
    if (filter === "open")   return now < p.end_time;
    if (filter === "closed") return now >= p.end_time;
    if (filter === "mine")   return p.created_by === mobile;
    return true;
  });

  const openCount   = polls.filter((p) => now < p.end_time).length;
  const closedCount = polls.filter((p) => now >= p.end_time).length;
  const mineCount   = polls.filter((p) => p.created_by === mobile).length;

  return (
    <div className="dashboard">
      <ToastContainer toasts={toasts} />

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            <span className="brand-icon">🏆</span>
            <span className="brand-name">IPL Polls</span>
          </div>

          <div className="nav-center">
            {["all", "open", "closed", "mine"].map((f) => (
              <button
                key={f}
                className={`nav-filter ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All Polls" : f === "open" ? `Live (${openCount})` : f === "closed" ? `Closed (${closedCount})` : `My Polls (${mineCount})`}
              </button>
            ))}
          </div>

          <div className="nav-right">
            <button className="btn btn-ipl btn-sm" onClick={() => setShowCreate(true)}>
              + Create Poll
            </button>
            <div className="avatar-wrap">
              <span className="avatar">{name?.charAt(0).toUpperCase()}</span>
              <div className="avatar-dropdown">
                <p className="av-name">{name}</p>
                <p className="av-mobile">{mobile}</p>
                <div className="av-divider" />
                <button className="av-btn" onClick={logout}>🚪 Logout</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Banner ────────────────────────────── */}
      <div className="dash-hero">
        <div className="dash-hero-inner">
          <h1>Welcome back, <span className="hi-name">{name?.split(" ")[0]}</span> 👋</h1>
          <p>Cast your vote, track results, and create your own match polls.</p>
          <div className="dash-stats">
            <div className="ds-item">
              <strong>{polls.length}</strong>
              <span>Total Polls</span>
            </div>
            <div className="ds-item">
              <strong className="green">{openCount}</strong>
              <span>Live Now</span>
            </div>
            <div className="ds-item">
              <strong>{Object.keys(votedMap).length}</strong>
              <span>Voted</span>
            </div>
          </div>
        </div>
        <div className="hero-decor">🏏</div>
      </div>

      {/* ── Cricket Widget ───────────────────────────── */}
      <div className="content-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <CricketWidget />
      </div>

      {/* ── Poll Grid ──────────────────────────────── */}
      <div className="polls-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner large" />
            <p>Loading polls...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏟️</span>
            <h3>No polls found</h3>
            <p>{filter === "mine" ? "You haven't created any polls yet." : "No polls in this category."}</p>
            {filter === "mine" && (
              <button className="btn btn-ipl" onClick={() => setShowCreate(true)}>
                + Create Your First Poll
              </button>
            )}
          </div>
        ) : (
          <div className="polls-grid">
            {filtered.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                mobile={mobile}
                votedOption={votedMap[poll.id]}
                onVote={handleVote}
                onEdit={() => setEditPoll(poll)}
                onDelete={() => handleDelete(poll.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────── */}
      {showCreate && (
        <CreatePollModal
          mobile={mobile}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadPolls(); showToast("Poll created! 🎉", "success"); }}
          showToast={showToast}
        />
      )}

      {editPoll && (
        <EditPollModal
          poll={editPoll}
          mobile={mobile}
          onClose={() => setEditPoll(null)}
          onUpdated={() => { setEditPoll(null); loadPolls(); showToast("Poll updated! ✅", "success"); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
