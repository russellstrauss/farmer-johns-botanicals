<?php
/**
 * Diagnostic script to find broken product images
 * 
 * This script will:
 * 1. Check for old URLs in attachment GUIDs
 * 2. Check for old URLs in serialized postmeta data
 * 3. List products with potentially broken images
 * 
 * Usage: Run this from WordPress root: php diagnose-broken-images.php
 */

// Load WordPress
require_once('wp-load.php');

if (!defined('ABSPATH')) {
    die('WordPress not loaded');
}

global $wpdb;

echo "=== Broken Product Images Diagnostic ===\n\n";

// Get current site URL
$site_url = get_option('siteurl');
echo "Current Site URL: {$site_url}\n\n";

// Old URLs to check for
$old_urls = array(
    'http://hammerheadsilver.local',
    'http://hammerheadsilver.com',
    'https://hammerheadsilver.com'
);

// 1. Check attachment GUIDs with old URLs
echo "1. Checking attachment GUIDs...\n";
$attachment_guids = $wpdb->get_results(
    "SELECT ID, guid, post_title 
     FROM {$wpdb->posts} 
     WHERE post_type = 'attachment' 
     AND (guid LIKE '%hammerheadsilver.local%' OR guid LIKE '%hammerheadsilver.com%')
     LIMIT 20"
);

if ($attachment_guids) {
    echo "   Found " . count($attachment_guids) . " attachments with old URLs in GUID:\n";
    foreach ($attachment_guids as $attachment) {
        echo "   - ID {$attachment->ID}: {$attachment->post_title}\n";
        echo "     GUID: {$attachment->guid}\n";
    }
} else {
    echo "   ✓ No old URLs found in attachment GUIDs\n";
}
echo "\n";

// 2. Check for old URLs in postmeta (including serialized data)
echo "2. Checking postmeta for old URLs...\n";
$old_meta = $wpdb->get_results(
    "SELECT post_id, meta_key, meta_value 
     FROM {$wpdb->postmeta} 
     WHERE (meta_value LIKE '%hammerheadsilver.local%' OR meta_value LIKE '%hammerheadsilver.com%')
     AND meta_key NOT LIKE '_edit%'
     LIMIT 20"
);

if ($old_meta) {
    echo "   Found " . count($old_meta) . " postmeta entries with old URLs:\n";
    foreach ($old_meta as $meta) {
        $value_preview = substr($meta->meta_value, 0, 100);
        echo "   - Post ID {$meta->post_id}, Key: {$meta->meta_key}\n";
        echo "     Value preview: {$value_preview}...\n";
    }
} else {
    echo "   ✓ No old URLs found in postmeta\n";
}
echo "\n";

// 3. Check WooCommerce products with images
echo "3. Checking WooCommerce products...\n";
$products = $wpdb->get_results(
    "SELECT p.ID, p.post_title, pm.meta_value as image_id
     FROM {$wpdb->posts} p
     LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
     WHERE p.post_type = 'product'
     AND p.post_status = 'publish'
     AND pm.meta_value IS NOT NULL
     LIMIT 20"
);

$broken_count = 0;
foreach ($products as $product) {
    $image_id = $product->image_id;
    if ($image_id) {
        $attachment = get_post($image_id);
        if ($attachment) {
            $image_url = wp_get_attachment_url($image_id);
            // Check if URL contains old domain
            $is_broken = false;
            foreach ($old_urls as $old_url) {
                if (strpos($image_url, $old_url) !== false) {
                    $is_broken = true;
                    break;
                }
            }
            
            if ($is_broken) {
                $broken_count++;
                echo "   ⚠ Product: {$product->post_title} (ID: {$product->ID})\n";
                echo "     Image URL: {$image_url}\n";
            }
        } else {
            $broken_count++;
            echo "   ⚠ Product: {$product->post_title} (ID: {$product->ID})\n";
            echo "     Image attachment not found (ID: {$image_id})\n";
        }
    }
}

if ($broken_count === 0) {
    echo "   ✓ No broken product images found\n";
} else {
    echo "\n   Found {$broken_count} products with potentially broken images\n";
}
echo "\n";

// 4. Check upload directory configuration
echo "4. Checking upload directory configuration...\n";
$upload_dir = wp_upload_dir();
echo "   Upload Base URL: {$upload_dir['baseurl']}\n";
echo "   Upload Base Dir: {$upload_dir['basedir']}\n";

// Check if base URL contains old domain
$upload_broken = false;
foreach ($old_urls as $old_url) {
    if (strpos($upload_dir['baseurl'], $old_url) !== false) {
        $upload_broken = true;
        echo "   ⚠ Upload base URL contains old domain!\n";
        break;
    }
}

if (!$upload_broken) {
    echo "   ✓ Upload directory URL looks correct\n";
}
echo "\n";

echo "=== Diagnostic Complete ===\n";
echo "\nIf issues were found, run the fix script: php fix-broken-images.php\n";

