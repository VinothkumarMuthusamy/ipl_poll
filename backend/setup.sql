-- ============================================
-- IPL Poll App - Database Setup
-- Run this in MySQL before starting the backend
-- ============================================

CREATE DATABASE IF NOT EXISTS ipl_app;
USE ipl_app;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_name VARCHAR(100) NOT NULL,
    team1 VARCHAR(50) DEFAULT '',
    team2 VARCHAR(50) DEFAULT '',
    option1 VARCHAR(50) NOT NULL,
    option2 VARCHAR(50) NOT NULL,
    match_date VARCHAR(50) DEFAULT '',
    votes1 INT DEFAULT 0,
    votes2 INT DEFAULT 0,
    end_time BIGINT NOT NULL,
    created_by VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes Table (enforces one vote per user per poll)
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    user_mobile VARCHAR(15) NOT NULL,
    option INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (poll_id, user_mobile),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- Optional: seed a sample poll for testing
-- INSERT INTO polls (match_name, team1, team2, option1, option2, match_date, end_time, created_by)
-- VALUES ('CSK vs MI', 'CSK', 'MI', 'Chennai Super Kings', 'Mumbai Indians', '2025-04-10', 9999999999999, '9999999999');

SELECT 'Database setup complete ✅' AS status;
