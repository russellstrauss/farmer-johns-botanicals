-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS russell_hammerhe_wrdp1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'russell_hhs_user'@'%' IDENTIFIED BY 'EZsDNwLGpIPKi4E';

-- Grant privileges
GRANT ALL PRIVILEGES ON russell_hammerhe_wrdp1.* TO 'russell_hhs_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

