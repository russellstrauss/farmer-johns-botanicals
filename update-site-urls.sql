-- SQL script to update WordPress site URLs in the database
-- Run this after importing the database backup
-- Usage: Execute this in the MySQL container or via MySQL client

-- Update siteurl and home options in wp_options table
UPDATE wp_options SET option_value = 'http://local.farmerjohnsbotanicals.com:8080' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'http://local.farmerjohnsbotanicals.com:8080' WHERE option_name = 'home';

-- Update URLs in post content (wp_posts table)
-- This updates URLs in post content, post excerpts, and post GUIDs
UPDATE wp_posts SET post_content = REPLACE(post_content, 'http://hammerheadsilver.local', 'http://local.farmerjohnsbotanicals.com:8080');
UPDATE wp_posts SET post_content = REPLACE(post_content, 'http://hammerheadsilver.com', 'http://local.farmerjohnsbotanicals.com:8080');
UPDATE wp_posts SET post_content = REPLACE(post_content, 'https://hammerheadsilver.com', 'http://local.farmerjohnsbotanicals.com:8080');
UPDATE wp_posts SET guid = REPLACE(guid, 'http://hammerheadsilver.local', 'http://local.farmerjohnsbotanicals.com:8080');
UPDATE wp_posts SET guid = REPLACE(guid, 'http://hammerheadsilver.com', 'http://local.farmerjohnsbotanicals.com:8080');
UPDATE wp_posts SET guid = REPLACE(guid, 'https://hammerheadsilver.com', 'http://local.farmerjohnsbotanicals.com:8080');

-- Update URLs in post meta (wp_postmeta table) - handles serialized data carefully
-- Note: Serialized data requires special handling. This is a basic approach.
-- For complex serialized data, consider using WordPress search-replace tools or WP-CLI
UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'http://hammerheadsilver.local', 'http://local.farmerjohnsbotanicals.com:8080') WHERE meta_value LIKE '%hammerheadsilver.local%';
UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'http://hammerheadsilver.com', 'http://local.farmerjohnsbotanicals.com:8080') WHERE meta_value LIKE '%hammerheadsilver.com%';
UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'https://hammerheadsilver.com', 'http://local.farmerjohnsbotanicals.com:8080') WHERE meta_value LIKE '%hammerheadsilver.com%';

-- Update URLs in comments (wp_comments table)
UPDATE wp_comments SET comment_content = REPLACE(comment_content, 'http://hammerheadsilver.local', 'http://local.farmerjohnsbotanicals.com:8080');
UPDATE wp_comments SET comment_content = REPLACE(comment_content, 'http://hammerheadsilver.com', 'http://local.farmerjohnsbotanicals.com:8080');

-- Update user email (optional - change if you want a different admin email)
-- UPDATE wp_users SET user_email = 'your-email@example.com' WHERE user_login = 'hammerhead';
-- UPDATE wp_options SET option_value = 'your-email@example.com' WHERE option_name = 'admin_email';

