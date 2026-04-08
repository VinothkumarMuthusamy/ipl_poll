import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast, ToastContainer } from "./useToast";
import API from "./api";
import "./Login.css";



const IPL_TEAMS = [
  "Chennai Super Kings", "Mumbai Indians", "Royal Challengers Bangalore",
  "Kolkata Knight Riders", "Delhi Capitals", "Punjab Kings",
  "Rajasthan Royals", "Sunrisers Hyderabad", "Gujarat Titans", "Lucknow Super Giants"
];

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { toasts, showToast } = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    const { name, mobile, password } = form;
    if (mode === "signup" && !name.trim()) return showToast("Name is required", "error");
    if (!mobile.trim()) return showToast("Mobile number is required", "error");
    if (mobile.length < 10) return showToast("Enter a valid 10-digit mobile", "error");
    if (!password.trim()) return showToast("Password is required", "error");
    if (mode === "signup" && password.length < 6) return showToast("Password must be at least 6 characters", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup"
            ? { name: name.trim(), mobile: mobile.trim(), password }
            : { mobile: mobile.trim(), password }
        ),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("mobile", data.mobile || mobile.trim());
        localStorage.setItem("name", data.name || name.trim());
        showToast(data.message, "success");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        showToast(data.message || "Something went wrong", "error");
      }
    } catch {
      showToast("Cannot connect to server. Is the backend running?", "error");
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setForm({ name: "", mobile: "", password: "" });
  };

  return (
    <div className="login-page">
      <ToastContainer toasts={toasts} />

      {/* Background orbs */}
      <div className="login-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Left Panel */}
      <div className="login-hero">
        <div className="hero-content">
          <div className="ipl-logo-wrap">
            <span className="ipl-trophy">🏆</span>
          </div>
          <h1 className="hero-title">IPL Poll App</h1>
          <p className="hero-subtitle">
            Vote for your favourite team, predict match winners, and track live poll results — all in one place.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">10</span>
              <span className="stat-label">Teams</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">74</span>
              <span className="stat-label">Matches</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">∞</span>
              <span className="stat-label">Polls</span>
            </div>
          </div>
          <div className="team-chips">
            {IPL_TEAMS.slice(0, 6).map((t) => (
              <span key={t} className="team-chip">{t.split(" ").slice(-2).join(" ")}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-form-wrap">
        <div className="login-card">
          {/* Tab switcher */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => mode !== "login" && switchMode()}
            >
              Login
            </button>
            <button
              className={`tab-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => mode !== "signup" && switchMode()}
            >
              Sign Up
            </button>
          </div>

          <div className="form-body">
            <div className="form-heading">
              <h2>{mode === "login" ? "Welcome back 👋" : "Create account 🚀"}</h2>
              <p>{mode === "login" ? "Enter your credentials to continue" : "Join and start voting!"}</p>
            </div>

            <div className="form-fields">
              {mode === "signup" && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      className="form-input with-icon"
                      placeholder="Virat Kohli"
                      value={form.name}
                      onChange={set("name")}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-wrap">
                  <span className="input-icon">📱</span>
                  <input
                    className="form-input with-icon"
                    placeholder="9876543210"
                    value={form.mobile}
                    onChange={set("mobile")}
                    maxLength={15}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    className="form-input with-icon"
                    type={showPass ? "text" : "password"}
                    placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                    value={form.password}
                    onChange={set("password")}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                  <button
                    className="pass-toggle"
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg btn-full submit-btn"
              onClick={submit}
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Processing...</> : mode === "login" ? "Login →" : "Create Account →"}
            </button>

            <p className="switch-text">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button className="link-btn" onClick={switchMode}>
                {mode === "login" ? "Sign up free" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
