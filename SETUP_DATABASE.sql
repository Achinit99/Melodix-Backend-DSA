-- ============================================================================
-- SAMPLE DATABASE SETUP FOR MUSIC PLAYLIST
-- ============================================================================
-- Run these SQL commands to create the database and sample users table.

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS playwave_db;

-- Use the database
USE playwave_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
('Eminem', 'eminem@example.com'),
('Kendrick Lamar', 'kendrick@example.com'),
('Tyla', 'tyla@example.com'),
('Drake', 'drake@example.com'),
('The Weeknd', 'weeknd@example.com');

-- View the data
SELECT * FROM users;
