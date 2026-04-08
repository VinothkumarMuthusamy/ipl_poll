import { useState } from "react";

import API from "./config";

export default function EditPollModal({ poll, mobile, onClose, onUpdated, showToast }) {
  const [form, setForm] = useState({
    match_name: poll.match_name,
    team1: poll.team1 || poll.option1,
    team2: poll.team2 || poll.option2,
    option1: poll.option1,
    option2: poll.option2,
    match_date: poll.match_date || "",
    end_time: poll.end_time,
    extendHours: "0",
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.match_name.trim()) return showToast("Match name is required", "error");
    if (!form.option1.trim() || !form.option2.trim()) return showToast("Both options are required", "error");

    const newEndTime = form.end_time + Number(form.extendHours) * 3600 * 1000;

    setLoading(true);
    try {
      const res = await fetch(`${API}/update-poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: poll.id,
          mobile,
          match_name: form.match_name.trim(),
          team1: form.team1,
          team2: form.team2,
          option1: form.option1.trim(),
          option2: form.option2.trim(),
          match_date: form.match_date,
          end_time: newEndTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdated();
      } else {
        showToast(data.message || "Update failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
    setLoading(false);
  };

  const expiresAt = new Date(form.end_time + Number(form.extendHours) * 3600000).toLocaleString();

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">✏️ Edit Poll</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Match Name</label>
            <input
              className="form-input"
              value={form.match_name}
              onChange={set("match_name")}
              placeholder="Match name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Option 1</label>
              <input
                className="form-input"
                value={form.option1}
                onChange={set("option1")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option 2</label>
              <input
                className="form-input"
                value={form.option2}
                onChange={set("option2")}
              />
            </div>
          </div>

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
            <label className="form-label">Extend Poll Duration</label>
            <select className="form-input" value={form.extendHours} onChange={set("extendHours")}>
              <option value="0">No extension</option>
              <option value="1">+1 hour</option>
              <option value="6">+6 hours</option>
              <option value="12">+12 hours</option>
              <option value="24">+24 hours</option>
              <option value="48">+48 hours</option>
            </select>
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            📅 Poll will expire: <strong style={{ color: "var(--text-secondary)" }}>{expiresAt}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
            {loading ? <><span className="spinner" /> Saving...</> : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
