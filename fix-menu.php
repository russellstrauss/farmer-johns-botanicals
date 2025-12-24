<?php
/**
 * Fix menu location assignment
 */

define('WP_USE_THEMES', false);
require_once(__DIR__ . '/wp-load.php');

// Get the menu ID (we know menu "Menu" has term_id 2)
$menu_id = 2;

// Set menu location
$locations = get_theme_mod('nav_menu_locations');
if (!is_array($locations)) {
    $locations = array();
}

// Assign menu to 'header' location
$locations['header'] = $menu_id;

// Save the menu locations
set_theme_mod('nav_menu_locations', $locations);

echo "Menu location fixed!\n";
echo "Menu ID $menu_id assigned to 'header' location.\n";

// Verify
$new_locations = get_theme_mod('nav_menu_locations');
echo "\nCurrent menu locations:\n";
print_r($new_locations);


