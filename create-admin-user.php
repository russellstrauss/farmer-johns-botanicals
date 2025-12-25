<?php
/**
 * Script to create a new WordPress admin user
 * Usage: Run this from command line: php create-admin-user.php
 */

// Load WordPress
require_once('wp-load.php');

// User credentials
$username = 'russell';
$password = 'pickle';
$email = 'russell@farmerjohnsbotanicals.com';

// Check if user already exists
if (username_exists($username)) {
    echo "Error: Username '$username' already exists!\n";
    exit(1);
}

if (email_exists($email)) {
    echo "Error: Email '$email' already exists!\n";
    exit(1);
}

// Create the user
$user_id = wp_create_user($username, $password, $email);

if (is_wp_error($user_id)) {
    echo "Error creating user: " . $user_id->get_error_message() . "\n";
    exit(1);
}

// Get the user object
$user = new WP_User($user_id);

// Set user role to administrator
$user->set_role('administrator');

echo "Successfully created admin user:\n";
echo "  Username: $username\n";
echo "  Email: $email\n";
echo "  Password: $password\n";
echo "  Role: Administrator\n";
echo "\n";
echo "You can now log in at: http://local.farmerjohnsbotanicals.com:8080/wp-admin/\n";
?>

