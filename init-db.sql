-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fjb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'russell_fjb_user'@'%' IDENTIFIED BY 'EZsDNwLGpIPKi4E';

-- Grant privileges
GRANT ALL PRIVILEGES ON fjb_db.* TO 'russell_fjb_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

