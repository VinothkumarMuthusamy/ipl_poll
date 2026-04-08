const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true // Crucial for running multiple SQL commands at once
});

console.log('🚀 Connecting to Railway MySQL to initialize tables...');

const sql = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');

// Filter out "USE ipl_app" or "CREATE DATABASE" if Railway already provides the DB name
// In this case, we know the DB is called 'railway', but setup.sql uses 'ipl_app'
// So we'll remove the database creation lines and use the existing connection
const purifiedSql = sql
  .replace(/CREATE DATABASE IF NOT EXISTS ipl_app;/g, '')
  .replace(/USE ipl_app;/g, '');

db.connect(err => {
  if (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  }

  db.query(purifiedSql, (err, results) => {
    if (err) {
      console.error('❌ Database initialization failed:', err);
    } else {
      console.log('✅ Database tables created successfully!');
      console.log('📊 Result:', results[results.length - 1]);
    }
    db.end();
  });
});
