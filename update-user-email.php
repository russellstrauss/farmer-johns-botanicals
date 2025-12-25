<?php
/**
 * Script to update WordPress user email
 * Usage: Run this from command line: php update-user-email.php
 */

// Load WordPress
require_once('wp-load.php');

// User credentials
$username = 'russell';
$new_email = 'russellstrauss@gmail.com';

// Get the user
$user = get_user_by('login', $username);

if (!$user) {
    echo "Error: Username '$username' not found!\n";
    exit(1);
}

// Check if email is already in use by another user
if (email_exists($new_email) && email_exists($new_email) != $user->ID) {
    echo "Error: Email '$new_email' is already in use by another user!\n";
    exit(1);
}

// Update the user email
$result = wp_update_user(array(
    'ID' => $user->ID,
    'user_email' => $new_email
));

if (is_wp_error($result)) {
    echo "Error updating email: " . $result->get_error_message() . "\n";
    exit(1);
}

echo "Successfully updated user email:\n";
echo "  Username: $username\n";
echo "  Old Email: " . $user->user_email . "\n";
echo "  New Email: $new_email\n";
echo "\n";
?>

