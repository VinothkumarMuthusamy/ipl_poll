const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2004",
  database: "ipl_app",
  port: 3306
});

db.connect(async (err) => {
  if (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected");

  const pollId = 9999;
  const mobile = "1234567890";
  const name = "Test User";
  const expiredTime = Date.now() - 3600000; // 1 hour ago

  try {
    // 1. Insert/Update User
    await db.promise().query("INSERT INTO users (name, mobile, password) VALUES (?, ?, 'hash') ON DUPLICATE KEY UPDATE name=?", [name, mobile, name]);
    
    // 2. Insert Poll
    await db.promise().query("DELETE FROM polls WHERE id=?", [pollId]);
    await db.promise().query("INSERT INTO polls (id, match_name, option1, option2, end_time, created_by) VALUES (?, 'Test vs Void', 'Alpha', 'Beta', ?, ?)", [pollId, expiredTime, mobile]);
    
    // 3. Insert Vote
    await db.promise().query("DELETE FROM votes WHERE poll_id=?", [pollId]);
    await db.promise().query("INSERT INTO votes (poll_id, user_mobile, `option`) VALUES (?, ?, 1)", [pollId, mobile]);
    
    console.log("✅ Test data setup complete");

    // 4. Test Endpoint (simulate fetch)
    const [results] = await db.promise().query(
      "SELECT users.name, votes.option FROM votes JOIN users ON votes.user_mobile = users.mobile WHERE votes.poll_id = ?",
      [pollId]
    );

    console.log("🔍 Database Results:", results);
    
    if (results.length > 0 && results[0].name === name && results[0].option === 1) {
      console.log("🏆 Backend Logic Verified!");
    } else {
      console.error("❌ Verification failed!");
    }

  } catch (e) {
    console.error("❌ Error during verification:", e.message);
  } finally {
    db.end();
  }
});
