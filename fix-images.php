<?php
/**
 * WordPress Image URL Fix Script
 * Properly fixes image URLs in serialized attachment metadata
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

echo "Fixing image URLs in WordPress database...\n";
echo "Old URLs: " . implode(', ', $old_urls) . "\n";
echo "New URL: $new_url\n\n";

// Fix attachment GUIDs
echo "1. Fixing attachment GUIDs...\n";
$updated = 0;
foreach ($old_urls as $old_url) {
    $result = $wpdb->query($wpdb->prepare(
        "UPDATE {$wpdb->posts} SET guid = REPLACE(guid, %s, %s)
         WHERE post_type = 'attachment' AND guid LIKE %s",
        $old_url, $new_url,
        '%' . $wpdb->esc_like($old_url) . '%'
    ));
    $updated += $result;
    echo "   Updated $result attachments with: $old_url\n";
}
echo "   Total GUIDs updated: $updated\n\n";

// Fix serialized attachment metadata
echo "2. Fixing serialized attachment metadata...\n";
$meta_results = $wpdb->get_results(
    "SELECT meta_id, post_id, meta_value 
     FROM {$wpdb->postmeta} 
     WHERE meta_key = '_wp_attachment_metadata'
     AND meta_value LIKE '%hammerheadsilver%'"
);

$updated_meta = 0;
foreach ($meta_results as $meta) {
    $original_value = $meta->meta_value;
    
    if (!is_serialized($original_value)) {
        continue;
    }
    
    $unserialized = @unserialize($original_value);
    if ($unserialized === false) {
        echo "   Warning: Could not unserialize meta_id {$meta->meta_id}\n";
        continue;
    }
    
    $changed = false;
    $new_unserialized = replace_urls_in_array($unserialized, $old_urls, $new_url, $changed);
    
    if ($changed) {
        $new_value = serialize($new_unserialized);
        $wpdb->update(
            $wpdb->postmeta,
            array('meta_value' => $new_value),
            array('meta_id' => $meta->meta_id),
            array('%s'),
            array('%d')
        );
        $updated_meta++;
    }
}
echo "   Updated $updated_meta attachment metadata records\n\n";

// Fix _wp_attached_file meta (contains relative paths, but check for any URLs)
echo "3. Fixing _wp_attached_file metadata...\n";
$file_meta = $wpdb->get_results(
    "SELECT meta_id, meta_value 
     FROM {$wpdb->postmeta} 
     WHERE meta_key = '_wp_attached_file'
     AND meta_value LIKE '%http%'"
);
$updated_files = 0;
foreach ($file_meta as $file) {
    $new_value = $file->meta_value;
    foreach ($old_urls as $old_url) {
        $new_value = str_replace($old_url, $new_url, $new_value);
    }
    if ($new_value !== $file->meta_value) {
        $wpdb->update(
            $wpdb->postmeta,
            array('meta_value' => $new_value),
            array('meta_id' => $file->meta_id),
            array('%s'),
            array('%d')
        );
        $updated_files++;
    }
}
echo "   Updated $updated_files file metadata records\n\n";

// Fix post content with image URLs
echo "4. Fixing image URLs in post content...\n";
$content_updated = 0;
foreach ($old_urls as $old_url) {
    $result = $wpdb->query($wpdb->prepare(
        "UPDATE {$wpdb->posts} SET 
            post_content = REPLACE(post_content, %s, %s)
         WHERE post_content LIKE %s",
        $old_url, $new_url,
        '%' . $wpdb->esc_like($old_url) . '%'
    ));
    $content_updated += $result;
    echo "   Updated $result posts with: $old_url\n";
}
echo "   Total posts updated: $content_updated\n\n";

// Regenerate attachment URLs using WordPress functions
echo "5. Regenerating attachment URLs using WordPress functions...\n";
$attachments = $wpdb->get_results(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_type = 'attachment' 
     AND post_mime_type LIKE 'image%'
     LIMIT 100"
);

$regenerated = 0;
foreach ($attachments as $attachment) {
    // Force WordPress to regenerate the URL
    $url = wp_get_attachment_url($attachment->ID);
    if ($url && strpos($url, $new_url) === 0) {
        $regenerated++;
    }
}
echo "   Checked $regenerated attachments\n\n";

echo "Done! Image URLs have been fixed.\n";
echo "\nNext steps:\n";
echo "1. Clear your browser cache (Ctrl+F5)\n";
echo "2. Refresh the page\n";
echo "3. If images still don't load, check file permissions:\n";
echo "   docker exec hammerhead-silver-wp chown -R www-data:www-data /var/www/html/wp-content/uploads\n";

/**
 * Recursively replace URLs in arrays
 */
function replace_urls_in_array($data, $old_urls, $new_url, &$changed) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = replace_urls_in_array($value, $old_urls, $new_url, $changed);
        }
    } elseif (is_object($data)) {
        foreach ($data as $key => $value) {
            $data->$key = replace_urls_in_array($value, $old_urls, $new_url, $changed);
        }
    } elseif (is_string($data)) {
        foreach ($old_urls as $old_url) {
            if (strpos($data, $old_url) !== false) {
                $data = str_replace($old_url, $new_url, $data);
                $changed = true;
            }
        }
    }
    return $data;
}

