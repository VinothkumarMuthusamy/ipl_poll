const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost", user: "root", password: "2004", database: "ipl_app",
});
db.connect(() => {
  db.query("DESCRIBE votes", (err, fields) => {
    console.log("Votes schema:", fields);
    db.query("SELECT * FROM votes", (err, rows) => {
      console.log("Existing votes:", rows);
      db.end();
    });
  });
});
