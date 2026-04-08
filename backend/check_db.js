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
  console.log("✅ Connected");

  db.query("SHOW TABLES", (err, tables) => {
    if (err) console.error(err);
    console.log("Tables:", tables);

    db.query("DESCRIBE polls", (err, fields) => {
      console.log("\nPolls schema:", fields);
      
      db.query("DESCRIBE votes", (err, fields) => {
        console.log("\nVotes schema:", fields);

        db.query("SELECT * FROM polls LIMIT 1", (err, polls) => {
          console.log("\nSample Poll:", polls);
          db.end();
        });
      });
    });
  });
});
