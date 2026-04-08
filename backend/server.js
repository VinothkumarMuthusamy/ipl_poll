const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const cricbuzzService = require("./utils/cricbuzzService");

const app = express();
app.use(cors());
app.use(express.json());

// ────────────────────────────────────────────
// DB Connection
// ────────────────────────────────────────────
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "2004",
  database: process.env.DB_NAME || "ipl_app",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// ────────────────────────────────────────────
// SIGNUP
// ────────────────────────────────────────────
app.post("/signup", async (req, res) => {
  const { name, mobile, password } = req.body;

  if (!name || !mobile || !password)
    return res.json({ success: false, message: "All fields are required." });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, mobile, password) VALUES (?, ?, ?)",
      [name, mobile, hash],
      (err) => {
        if (err)
          return res.json({ success: false, message: "Mobile already registered." });
        res.json({ success: true, message: "Signup successful!" });
      }
    );
  } catch (e) {
    res.json({ success: false, message: "Server error." });
  }
});

// ────────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────────
app.post("/login", (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password)
    return res.json({ success: false, message: "All fields are required." });

  db.query("SELECT * FROM users WHERE mobile=?", [mobile], async (err, result) => {
    if (err || result.length === 0)
      return res.json({ success: false, message: "User not found." });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.json({ success: true, message: "Login successful!", name: user.name, mobile: user.mobile });
    } else {
      res.json({ success: false, message: "Incorrect password." });
    }
  });
});

// ────────────────────────────────────────────
// GET ALL POLLS
// ────────────────────────────────────────────
app.get("/polls", (req, res) => {
  db.query("SELECT * FROM polls ORDER BY id DESC", (err, data) => {
    if (err) return res.json([]);
    res.json(data);
  });
});

// ────────────────────────────────────────────
// GET POLL BY ID
// ────────────────────────────────────────────
app.get("/polls/:id", (req, res) => {
  db.query("SELECT * FROM polls WHERE id=?", [req.params.id], (err, data) => {
    if (err || data.length === 0) return res.json(null);
    res.json(data[0]);
  });
});

// ────────────────────────────────────────────
// CREATE POLL
// ────────────────────────────────────────────
app.post("/create-poll", (req, res) => {
  const { match_name, team1, team2, option1, option2, match_date, end_time, mobile } = req.body;

  if (!match_name || !option1 || !option2 || !end_time || !mobile)
    return res.json({ success: false, message: "Missing fields." });

  db.query(
    "INSERT INTO polls (match_name, team1, team2, option1, option2, match_date, end_time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [match_name, team1 || "", team2 || "", option1, option2, match_date || "", end_time, mobile],
    (err) => {
      if (err) return res.json({ success: false, message: "Failed to create poll." });
      res.json({ success: true, message: "Poll created!" });
    }
  );
});

// ────────────────────────────────────────────
// VOTE
// ────────────────────────────────────────────
app.post("/vote", (req, res) => {
  const { poll_id, mobile, vote_option } = req.body;
  console.log("🗳️ Vote request body:", req.body);

  db.query(
    "SELECT * FROM votes WHERE poll_id=? AND user_mobile=?",
    [poll_id, mobile],
    (err, result) => {
      if (result && result.length > 0)
        return res.json({ success: false, message: "Already voted!" });

      db.query(
        "INSERT INTO votes (poll_id, user_mobile, `option`) VALUES (?, ?, ?)",
        [poll_id, mobile, vote_option],
        (err2) => {
          if (err2) {
            console.error("❌ Vote insertion failed:", err2.message);
            return res.json({ success: false, message: "Vote failed." });
          }

          const col = vote_option === 1 ? "votes1" : "votes2";
          db.query(`UPDATE polls SET ${col} = ${col} + 1 WHERE id=?`, [poll_id], (err3) => {
            if (err3) console.error("❌ Poll update failed:", err3.message);
            res.json({ success: true, message: "Vote recorded!" });
          });
        }
      );
    }
  );
});

// ────────────────────────────────────────────
// CHECK IF USER VOTED
// ────────────────────────────────────────────
app.get("/voted/:poll_id/:mobile", (req, res) => {
  const { poll_id, mobile } = req.params;
  db.query(
    "SELECT * FROM votes WHERE poll_id=? AND user_mobile=?",
    [poll_id, mobile],
    (err, result) => {
      if (result && result.length > 0) {
        res.json({ voted: true, option: result[0].vote_option });
      } else {
        res.json({ voted: false });
      }
    }
  );
});

// ────────────────────────────────────────────
// UPDATE POLL (owner only, before expiry)
// ────────────────────────────────────────────
app.post("/update-poll", (req, res) => {
  const { id, mobile, match_name, team1, team2, option1, option2, match_date, end_time } = req.body;

  db.query("SELECT * FROM polls WHERE id=?", [id], (err, result) => {
    if (err || result.length === 0) return res.json({ success: false, message: "Poll not found." });

    const poll = result[0];

    if (poll.created_by !== mobile)
      return res.json({ success: false, message: "Not authorized." });

    if (Date.now() > poll.end_time)
      return res.json({ success: false, message: "Poll has expired." });

    db.query(
      "UPDATE polls SET match_name=?, team1=?, team2=?, option1=?, option2=?, match_date=?, end_time=? WHERE id=?",
      [match_name, team1 || "", team2 || "", option1, option2, match_date || "", end_time, id],
      () => res.json({ success: true, message: "Poll updated!" })
    );
  });
});

// ────────────────────────────────────────────
// DELETE POLL (owner only)
// ────────────────────────────────────────────
app.delete("/delete-poll/:id", (req, res) => {
  const { id } = req.params;
  const { mobile } = req.body;

  db.query("SELECT * FROM polls WHERE id=?", [id], (err, result) => {
    if (err || result.length === 0) return res.json({ success: false, message: "Poll not found." });
    if (result[0].created_by !== mobile)
      return res.json({ success: false, message: "Not authorized." });

    db.query("DELETE FROM polls WHERE id=?", [id], () => {
      db.query("DELETE FROM votes WHERE poll_id=?", [id]);
      res.json({ success: true, message: "Poll deleted." });
    });
  });
});

// ────────────────────────────────────────────
// CRICKET DATA (Live, Fixtures, Points Table)
// ────────────────────────────────────────────
app.get("/api/cricket/live", async (req, res) => {
  const scores = await cricbuzzService.getLiveScores();
  res.json(scores);
});

app.get("/api/cricket/completed", async (req, res) => {
  const completed = await cricbuzzService.getCompleted();
  res.json(completed);
});

app.get("/api/cricket/fixtures", async (req, res) => {
  const fixtures = await cricbuzzService.getFixtures();
  res.json(fixtures);
});

app.get("/api/cricket/points-table", async (req, res) => {
  const table = await cricbuzzService.getPointsTable();
  res.json(table);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
