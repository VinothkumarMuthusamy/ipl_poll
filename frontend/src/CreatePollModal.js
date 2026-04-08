import { useState } from "react";

const API = "http://localhost:5000";

const TEAMS = [
  "Chennai Super Kings", "Mumbai Indians", "Royal Challengers Bangalore",
  "Kolkata Knight Riders", "Delhi Capitals", "Punjab Kings",
  "Rajasthan Royals", "Sunrisers Hyderabad", "Gujarat Titans", "Lucknow Super Giants"
];

export default function CreatePollModal({ mobile, onClose, onCreated, showToast }) {
  const [form, setForm] = useState({
    match_name: "",
    team1: TEAMS[0],
    team2: TEAMS[1],
    option1: TEAMS[0],
    option2: TEAMS[1],
    match_date: "",
    duration: "24",   // hours
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: val };
      // sync team selection → option label
      if (key === "team1") next.option1 = val;
      if (key === "team2") next.option2 = val;
      return next;
    });
  };

  const submit = async () => {
    if (!form.match_name.trim()) return showToast("Match name is required", "error");
    if (!form.option1.trim() || !form.option2.trim()) return showToast("Both team options are required", "error");
    if (form.option1 === form.option2) return showToast("Teams must be different", "error");

    const end_time = Date.now() + Number(form.duration) * 3600 * 1000;
    setLoading(true);
    try {
      const res = await fetch(`${API}/create-poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_name: form.match_name.trim(),
          team1: form.team1,
          team2: form.team2,
          option1: form.option1.trim(),
          option2: form.option2.trim(),
          match_date: form.match_date,
          end_time,
          mobile,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated();
      } else {
        showToast(data.message || "Failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">🏏 Create New Poll</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Match Name</label>
            <input
              className="form-input"
              placeholder="e.g. CSK vs MI — Match 12"
              value={form.match_name}
              onChange={set("match_name")}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Team 1</label>
              <select className="form-input" value={form.team1} onChange={set("team1")}>
                {TEAMS.map((t) => <option key={t}>{t}</option>)}
                <option value="custom">Custom...</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team 2</label>
              <select className="form-input" value={form.team2} onChange={set("team2")}>
                {TEAMS.map((t) => <option key={t}>{t}</option>)}
                <option value="custom">Custom...</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Option 1 Label</label>
              <input
                className="form-input"
                value={form.option1}
                onChange={set("option1")}
                placeholder="Or enter custom label"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option 2 Label</label>
              <input
                className="form-input"
                value={form.option2}
                onChange={set("option2")}
                placeholder="Or enter custom label"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Match Date (optional)</label>
              <input
                type="date"
                className="form-input"
                value={form.match_date}
                onChange={set("match_date")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Poll Duration</label>
              <select className="form-input" value={form.duration} onChange={set("duration")}>
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="168">1 week</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-ipl btn-full" onClick={submit} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating...</> : "🚀 Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
}
