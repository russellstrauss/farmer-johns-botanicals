<?php
/**
 * WordPress URL Fix Script
 * Fixes all URLs in the database, including serialized data
 */

define('WP_USE_THEMES', false);
require_once(__DIR__ . '/wp-load.php');

global $wpdb;

$old_urls = array(
    'http://hammerheadsilver.local',
    'https://hammerheadsilver.local',
    'http://hammerheadsilver.com',
    'https://hammerheadsilver.com',
);

$new_url = 'http://local.hammerheadsilver.com:8080';

echo "Fixing URLs in WordPress database...\n";
echo "Old URLs: " . implode(', ', $old_urls) . "\n";
echo "New URL: $new_url\n\n";

// Fix wp_posts
echo "Updating wp_posts...\n";
foreach ($old_urls as $old_url) {
    $wpdb->query($wpdb->prepare(
        "UPDATE {$wpdb->posts} SET 
            post_content = REPLACE(post_content, %s, %s),
            post_excerpt = REPLACE(post_excerpt, %s, %s),
            guid = REPLACE(guid, %s, %s)
        WHERE post_content LIKE %s OR post_excerpt LIKE %s OR guid LIKE %s",
        $old_url, $new_url,
        $old_url, $new_url,
        $old_url, $new_url,
        '%' . $wpdb->esc_like($old_url) . '%',
        '%' . $wpdb->esc_like($old_url) . '%',
        '%' . $wpdb->esc_like($old_url) . '%'
    ));
    echo "  Updated posts with: $old_url\n";
}

// Fix wp_postmeta (including serialized data)
echo "\nUpdating wp_postmeta (including serialized data)...\n";
$meta_results = $wpdb->get_results(
    "SELECT meta_id, meta_value FROM {$wpdb->postmeta} 
     WHERE meta_value LIKE '%hammerheadsilver%' 
     AND (meta_key LIKE '%_wp_attachment%' OR meta_value LIKE '%http%')"
);

$updated = 0;
foreach ($meta_results as $meta) {
    $original_value = $meta->meta_value;
    $new_value = $original_value;
    
    // Check if it's serialized
    if (is_serialized($original_value)) {
        $unserialized = unserialize($original_value);
        if ($unserialized !== false) {
            $new_unserialized = replace_urls_recursive($unserialized, $old_urls, $new_url);
            if ($new_unserialized !== $unserialized) {
                $new_value = serialize($new_unserialized);
            }
        }
    } else {
        // Simple string replace for non-serialized
        foreach ($old_urls as $old_url) {
            $new_value = str_replace($old_url, $new_url, $new_value);
        }
    }
    
    if ($new_value !== $original_value) {
        $wpdb->update(
            $wpdb->postmeta,
            array('meta_value' => $new_value),
            array('meta_id' => $meta->meta_id),
            array('%s'),
            array('%d')
        );
        $updated++;
    }
}
echo "  Updated $updated postmeta records\n";

// Fix wp_options
echo "\nUpdating wp_options...\n";
foreach ($old_urls as $old_url) {
    $wpdb->query($wpdb->prepare(
        "UPDATE {$wpdb->options} SET option_value = REPLACE(option_value, %s, %s)
         WHERE option_value LIKE %s",
        $old_url, $new_url,
        '%' . $wpdb->esc_like($old_url) . '%'
    ));
    echo "  Updated options with: $old_url\n";
}

// Fix wp_comments
echo "\nUpdating wp_comments...\n";
foreach ($old_urls as $old_url) {
    $wpdb->query($wpdb->prepare(
        "UPDATE {$wpdb->comments} SET 
            comment_content = REPLACE(comment_content, %s, %s)
         WHERE comment_content LIKE %s",
        $old_url, $new_url,
        '%' . $wpdb->esc_like($old_url) . '%'
    ));
    echo "  Updated comments with: $old_url\n";
}

echo "\nDone! All URLs have been updated.\n";

/**
 * Recursively replace URLs in arrays and objects
 */
function replace_urls_recursive($data, $old_urls, $new_url) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = replace_urls_recursive($value, $old_urls, $new_url);
        }
    } elseif (is_object($data)) {
        foreach ($data as $key => $value) {
            $data->$key = replace_urls_recursive($value, $old_urls, $new_url);
        }
    } elseif (is_string($data)) {
        foreach ($old_urls as $old_url) {
            $data = str_replace($old_url, $new_url, $data);
        }
    }
    return $data;
}




