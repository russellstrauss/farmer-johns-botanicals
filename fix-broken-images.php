<?php
/**
 * Fix broken product images by updating URLs in the database
 * 
 * This script properly handles serialized data and updates:
 * 1. Attachment GUIDs
 * 2. Serialized postmeta data (using proper unserialize/serialize)
 * 3. Post content with image URLs
 * 
 * Usage: Run this from WordPress root: php fix-broken-images.php
 */

// Load WordPress
require_once('wp-load.php');

if (!defined('ABSPATH')) {
    die('WordPress not loaded');
}

global $wpdb;

echo "=== Fixing Broken Product Images ===\n\n";

// Get current site URL
$site_url = get_option('siteurl');
$new_url = $site_url;
echo "New Site URL: {$new_url}\n\n";

// Old URLs to replace
$old_urls = array(
    'http://hammerheadsilver.local',
    'http://hammerheadsilver.com',
    'https://hammerheadsilver.com'
);

// Function to safely replace URLs in serialized data
function fix_serialized_urls($value, $old_urls, $new_url) {
    // Check if value is serialized (WordPress way)
    if (!is_serialized($value)) {
        // Not serialized, simple replace
        foreach ($old_urls as $old_url) {
            $value = str_replace($old_url, $new_url, $value);
        }
        return $value;
    }
    
    // Unserialize, fix, and re-serialize
    $data = @unserialize($value);
    if ($data === false && $value !== serialize(false)) {
        // Failed to unserialize, try simple replace as fallback
        foreach ($old_urls as $old_url) {
            $value = str_replace($old_url, $new_url, $value);
        }
        return $value;
    }
    
    // Recursively fix URLs in the data
    $data = fix_urls_recursive($data, $old_urls, $new_url);
    
    return serialize($data);
}

// Recursively fix URLs in arrays and objects
function fix_urls_recursive($data, $old_urls, $new_url) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = fix_urls_recursive($value, $old_urls, $new_url);
        }
    } elseif (is_object($data)) {
        foreach ($data as $key => $value) {
            $data->$key = fix_urls_recursive($value, $old_urls, $new_url);
        }
    } elseif (is_string($data)) {
        foreach ($old_urls as $old_url) {
            $data = str_replace($old_url, $new_url, $data);
        }
    }
    return $data;
}

// 1. Fix attachment GUIDs
echo "1. Fixing attachment GUIDs...\n";
$updated = 0;
foreach ($old_urls as $old_url) {
    $result = $wpdb->query(
        $wpdb->prepare(
            "UPDATE {$wpdb->posts} 
             SET guid = REPLACE(guid, %s, %s) 
             WHERE post_type = 'attachment' 
             AND guid LIKE %s",
            $old_url,
            $new_url,
            '%' . $wpdb->esc_like($old_url) . '%'
        )
    );
    $updated += $result;
}
echo "   Updated {$updated} attachment GUIDs\n\n";

// 2. Fix postmeta (including serialized data)
echo "2. Fixing postmeta (handling serialized data)...\n";
$meta_updated = 0;

// Get all postmeta entries that might contain old URLs
$meta_entries = $wpdb->get_results(
    "SELECT meta_id, post_id, meta_key, meta_value 
     FROM {$wpdb->postmeta} 
     WHERE (meta_value LIKE '%hammerheadsilver.local%' OR meta_value LIKE '%hammerheadsilver.com%')
     AND meta_key NOT LIKE '_edit%'"
);

foreach ($meta_entries as $meta) {
    $fixed_value = fix_serialized_urls($meta->meta_value, $old_urls, $new_url);
    
    if ($fixed_value !== $meta->meta_value) {
        $wpdb->update(
            $wpdb->postmeta,
            array('meta_value' => $fixed_value),
            array('meta_id' => $meta->meta_id),
            array('%s'),
            array('%d')
        );
        $meta_updated++;
    }
}

echo "   Updated {$meta_updated} postmeta entries\n\n";

// 3. Fix post content
echo "3. Fixing post content...\n";
$content_updated = 0;
foreach ($old_urls as $old_url) {
    $result = $wpdb->query(
        $wpdb->prepare(
            "UPDATE {$wpdb->posts} 
             SET post_content = REPLACE(post_content, %s, %s) 
             WHERE post_content LIKE %s",
            $old_url,
            $new_url,
            '%' . $wpdb->esc_like($old_url) . '%'
        )
    );
    $content_updated += $result;
}
echo "   Updated {$content_updated} posts with old URLs in content\n\n";

// 4. Fix comments
echo "4. Fixing comments...\n";
$comments_updated = 0;
foreach ($old_urls as $old_url) {
    $result = $wpdb->query(
        $wpdb->prepare(
            "UPDATE {$wpdb->comments} 
             SET comment_content = REPLACE(comment_content, %s, %s) 
             WHERE comment_content LIKE %s",
            $old_url,
            $new_url,
            '%' . $wpdb->esc_like($old_url) . '%'
        )
    );
    $comments_updated += $result;
}
echo "   Updated {$comments_updated} comments with old URLs\n\n";

// 5. Clear object cache
echo "5. Clearing WordPress cache...\n";
wp_cache_flush();
echo "   Cache cleared\n\n";

echo "=== Fix Complete ===\n";
echo "\nPlease check your product images now. If issues persist, you may need to:\n";
echo "1. Regenerate thumbnails (use a plugin like 'Regenerate Thumbnails')\n";
echo "2. Clear any caching plugins\n";
echo "3. Check that your uploads directory is accessible\n";

