<?php
/**
 * Remove Broken Product Images
 * 
 * This script identifies products with broken images (where image files don't exist on disk)
 * and removes those broken references from the database. If a product's featured image is broken
 * but has working gallery images, it promotes the first working gallery image to featured.
 * 
 * Usage: php remove-broken-product-images.php [--dry-run] [--execute]
 *   --dry-run: Only report, don't make changes (default)
 *   --execute: Actually update the database
 */

// Load WordPress
require_once('wp-load.php');

if (!defined('ABSPATH')) {
    die('WordPress not loaded');
}

// Check if WooCommerce is active
if (!class_exists('WooCommerce')) {
    die('WooCommerce is not active');
}

// Parse command line arguments
$dry_run = true;
$execute = false;

if (php_sapi_name() === 'cli') {
    $args = $argv;
    if (in_array('--execute', $args)) {
        $dry_run = false;
        $execute = true;
    }
    if (in_array('--dry-run', $args)) {
        $dry_run = true;
        $execute = false;
    }
}

global $wpdb;

echo "=== Remove Broken Product Images ===\n\n";
echo "Mode: " . ($dry_run ? "DRY RUN (no changes will be made)" : "EXECUTE (database will be updated)") . "\n\n";

// Results array to track all changes
$results = array();
$stats = array(
    'total_products' => 0,
    'products_with_images' => 0,
    'products_with_broken_images' => 0,
    'broken_featured_images' => 0,
    'broken_gallery_images' => 0,
    'images_promoted' => 0,
    'images_removed' => 0
);

/**
 * Check if an image file exists on disk
 * 
 * @param int $attachment_id Attachment ID
 * @return bool True if file exists, false otherwise
 */
function check_image_exists($attachment_id) {
    if (!$attachment_id || $attachment_id <= 0) {
        return false;
    }
    
    // Get the attachment post
    $attachment = get_post($attachment_id);
    if (!$attachment || $attachment->post_type !== 'attachment') {
        return false;
    }
    
    // Get the file path
    $file_path = get_attached_file($attachment_id);
    if (!$file_path) {
        return false;
    }
    
    // Check if file exists
    return file_exists($file_path);
}

/**
 * Remove broken image references from a product
 * 
 * @param int $product_id Product ID
 * @param int|null $broken_featured_id Broken featured image ID (or null)
 * @param array $broken_gallery_ids Array of broken gallery image IDs
 * @param array $working_gallery_ids Array of working gallery image IDs
 * @param bool $dry_run Whether this is a dry run
 * @return array Result information
 */
function remove_broken_images($product_id, $broken_featured_id, $broken_gallery_ids, $working_gallery_ids, $dry_run = true) {
    global $wpdb;
    
    $result = array(
        'product_id' => $product_id,
        'actions' => array(),
        'new_featured_id' => null,
        'new_gallery_ids' => array()
    );
    
    $product = wc_get_product($product_id);
    if (!$product) {
        return $result;
    }
    
    $gallery_needs_update = false;
    $updated_working_gallery_ids = $working_gallery_ids;
    
    // Handle broken featured image
    if ($broken_featured_id) {
        if ($dry_run) {
            $result['actions'][] = "Would remove broken featured image ID: {$broken_featured_id}";
            // If we have working gallery images, note that we would promote the first one
            if (!empty($updated_working_gallery_ids)) {
                $new_featured_id = $updated_working_gallery_ids[0];
                $result['new_featured_id'] = $new_featured_id;
                $result['actions'][] = "Would promote gallery image ID {$new_featured_id} to featured";
                $updated_working_gallery_ids = array_slice($updated_working_gallery_ids, 1);
                $gallery_needs_update = true;
            }
        } else {
            // Remove featured image using WooCommerce method
            $product->set_image_id('');
            $result['actions'][] = "Removed broken featured image ID: {$broken_featured_id}";
            
            // If we have working gallery images, promote the first one
            if (!empty($updated_working_gallery_ids)) {
                $new_featured_id = $updated_working_gallery_ids[0];
                $product->set_image_id($new_featured_id);
                $result['new_featured_id'] = $new_featured_id;
                $result['actions'][] = "Promoted gallery image ID {$new_featured_id} to featured";
                
                // Remove it from gallery since it's now featured
                $updated_working_gallery_ids = array_slice($updated_working_gallery_ids, 1);
                $gallery_needs_update = true;
            }
        }
    }
    
    // Handle broken gallery images
    if (!empty($broken_gallery_ids)) {
        if ($dry_run) {
            $result['actions'][] = "Would remove broken gallery image IDs: " . implode(', ', $broken_gallery_ids);
        } else {
            $gallery_needs_update = true;
        }
    }
    
    // Update gallery if needed (broken images removed or image promoted to featured)
    if ($gallery_needs_update) {
        if ($dry_run) {
            // In dry-run, just report what would happen
            if (!empty($updated_working_gallery_ids)) {
                $result['new_gallery_ids'] = $updated_working_gallery_ids;
                if (!empty($broken_gallery_ids)) {
                    $result['actions'][] = "Would update gallery, remove IDs: " . implode(', ', $broken_gallery_ids);
                } else {
                    $result['actions'][] = "Would update gallery (image promoted to featured)";
                }
            } else {
                if (!empty($broken_gallery_ids)) {
                    $result['actions'][] = "Would remove gallery (all images were broken)";
                }
            }
        } else {
            // Actually update the gallery
            if (!empty($updated_working_gallery_ids)) {
                $product->set_gallery_image_ids($updated_working_gallery_ids);
                $result['new_gallery_ids'] = $updated_working_gallery_ids;
                if (!empty($broken_gallery_ids)) {
                    $result['actions'][] = "Updated gallery, removed IDs: " . implode(', ', $broken_gallery_ids);
                }
            } else {
                // No working gallery images left, clear the gallery
                $product->set_gallery_image_ids(array());
                if (!empty($broken_gallery_ids)) {
                    $result['actions'][] = "Removed gallery (all images were broken)";
                }
            }
        }
    }
    
    // Save product if we made changes
    if (!$dry_run && ($broken_featured_id || !empty($broken_gallery_ids))) {
        $product->save();
    }
    
    return $result;
}

// Get all published products
echo "Fetching all published products...\n";
$products = $wpdb->get_results(
    "SELECT ID, post_title 
     FROM {$wpdb->posts} 
     WHERE post_type = 'product' 
     AND post_status = 'publish'
     ORDER BY ID"
);

$stats['total_products'] = count($products);
echo "Found {$stats['total_products']} published products\n\n";

// Process each product
foreach ($products as $product_post) {
    $product_id = $product_post->ID;
    $product_name = $product_post->post_title;
    
    // Get product object
    $product = wc_get_product($product_id);
    if (!$product) {
        continue;
    }
    
    // Get featured image ID
    $featured_image_id = $product->get_image_id();
    
    // Get gallery image IDs
    $gallery_image_ids = $product->get_gallery_image_ids();
    
    // Skip products with no images
    if (!$featured_image_id && empty($gallery_image_ids)) {
        continue;
    }
    
    $stats['products_with_images']++;
    
    // Check featured image
    $featured_exists = false;
    $broken_featured_id = null;
    if ($featured_image_id) {
        $featured_exists = check_image_exists($featured_image_id);
        if (!$featured_exists) {
            $broken_featured_id = $featured_image_id;
            $stats['broken_featured_images']++;
        }
    }
    
    // Check gallery images
    $working_gallery_ids = array();
    $broken_gallery_ids = array();
    
    foreach ($gallery_image_ids as $gallery_id) {
        if (check_image_exists($gallery_id)) {
            $working_gallery_ids[] = $gallery_id;
        } else {
            $broken_gallery_ids[] = $gallery_id;
            $stats['broken_gallery_images']++;
        }
    }
    
    // If we have any broken images, process this product
    if ($broken_featured_id || !empty($broken_gallery_ids)) {
        $stats['products_with_broken_images']++;
        
        // Get product SKU
        $sku = $product->get_sku();
        
        // Remove broken images
        $result = remove_broken_images(
            $product_id,
            $broken_featured_id,
            $broken_gallery_ids,
            $working_gallery_ids,
            $dry_run
        );
        
        // Track if we promoted an image
        if ($result['new_featured_id']) {
            $stats['images_promoted']++;
        }
        
        if (!empty($broken_gallery_ids) || $broken_featured_id) {
            $stats['images_removed']++;
        }
        
        // Store result for report
        $results[] = array(
            'product_id' => $product_id,
            'product_name' => $product_name,
            'sku' => $sku ? $sku : '',
            'broken_featured_id' => $broken_featured_id ? $broken_featured_id : '',
            'broken_gallery_ids' => implode(', ', $broken_gallery_ids),
            'working_gallery_ids' => implode(', ', $working_gallery_ids),
            'new_featured_id' => $result['new_featured_id'] ? $result['new_featured_id'] : '',
            'new_gallery_ids' => implode(', ', $result['new_gallery_ids']),
            'actions' => implode('; ', $result['actions'])
        );
        
        // Show progress
        echo "Product #{$product_id}: {$product_name}\n";
        if ($broken_featured_id) {
            echo "  - Broken featured image: ID {$broken_featured_id}\n";
        }
        if (!empty($broken_gallery_ids)) {
            echo "  - Broken gallery images: " . implode(', ', $broken_gallery_ids) . "\n";
        }
        foreach ($result['actions'] as $action) {
            echo "  - {$action}\n";
        }
        echo "\n";
    }
}

// Generate CSV report
echo "\n=== Generating Report ===\n";
$timestamp = date('Y-m-d_H-i-s');
$report_file = "broken-images-report-{$timestamp}.csv";

$fp = fopen($report_file, 'w');

// Write header
fputcsv($fp, array(
    'Product ID',
    'Product Name',
    'SKU',
    'Broken Featured Image ID',
    'Broken Gallery Image IDs',
    'Working Gallery Image IDs',
    'New Featured Image ID',
    'New Gallery Image IDs',
    'Actions Taken'
));

// Write data
foreach ($results as $result) {
    fputcsv($fp, array(
        $result['product_id'],
        $result['product_name'],
        $result['sku'],
        $result['broken_featured_id'],
        $result['broken_gallery_ids'],
        $result['working_gallery_ids'],
        $result['new_featured_id'],
        $result['new_gallery_ids'],
        $result['actions']
    ));
}

fclose($fp);

echo "Report saved to: {$report_file}\n\n";

// Print summary
echo "=== Summary ===\n";
echo "Total products checked: {$stats['total_products']}\n";
echo "Products with images: {$stats['products_with_images']}\n";
echo "Products with broken images: {$stats['products_with_broken_images']}\n";
echo "Broken featured images: {$stats['broken_featured_images']}\n";
echo "Broken gallery images: {$stats['broken_gallery_images']}\n";
echo "Images promoted to featured: {$stats['images_promoted']}\n";
echo "Total images removed: {$stats['images_removed']}\n\n";

if ($dry_run) {
    echo "=== DRY RUN COMPLETE ===\n";
    echo "No changes were made to the database.\n";
    echo "Review the report and run with --execute to apply changes.\n";
} else {
    echo "=== EXECUTION COMPLETE ===\n";
    echo "Database has been updated. Review the report for details.\n";
}

echo "\n";

