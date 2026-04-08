const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2004",
  database: "ipl_app",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL");

  const drop = "DROP TABLE IF EXISTS votes";
  const create = `
    CREATE TABLE votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      poll_id INT NOT NULL,
      user_mobile VARCHAR(15) NOT NULL,
      \`option\` INT NOT NULL,
      voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_vote (poll_id, user_mobile),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    )
  `;

  db.query(drop, (err) => {
    if (err) {
      console.error("❌ Drop failed:", err.message);
      db.end();
      return;
    }
    console.log("✅ Dropped old votes table (if any)");

    db.query(create, (err) => {
      if (err) {
        console.error("❌ Create failed:", err.message);
      } else {
        console.log("✅ Votes table recreated successfully with `option` column");
      }
      db.end();
    });
  });
});
