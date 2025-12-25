<?php
/**
 * Export WooCommerce Products to JSON
 * 
 * This script exports all WooCommerce products to a JSON file
 * for use in the static e-commerce site.
 * 
 * Usage: php export-products.php
 */

// Load WordPress
require_once(__DIR__ . '/../wp-load.php');

// Ensure WooCommerce is active
if (!class_exists('WooCommerce')) {
    die("Error: WooCommerce is not active.\n");
}

// Get all published products
$products = wc_get_products(array(
    'status' => 'publish',
    'limit' => -1, // Get all products
    'orderby' => 'menu_order',
    'order' => 'ASC'
));

$export_data = array();

foreach ($products as $product) {
    // Get product images
    $image_ids = $product->get_gallery_image_ids();
    $images = array();
    
    // Add featured image first
    $featured_image_id = $product->get_image_id();
    if ($featured_image_id) {
        $featured_image_url = wp_get_attachment_image_url($featured_image_id, 'full');
        $images[] = $featured_image_url;
    }
    
    // Add gallery images
    foreach ($image_ids as $image_id) {
        $image_url = wp_get_attachment_image_url($image_id, 'full');
        if ($image_url) {
            $images[] = $image_url;
        }
    }
    
    // Get product categories
    $categories = array();
    $category_terms = wp_get_post_terms($product->get_id(), 'product_cat');
    foreach ($category_terms as $term) {
        $categories[] = array(
            'id' => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug
        );
    }
    
    // Get product tags
    $tags = array();
    $tag_terms = wp_get_post_terms($product->get_id(), 'product_tag');
    foreach ($tag_terms as $term) {
        $tags[] = array(
            'id' => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug
        );
    }
    
    // Get product attributes if any
    $attributes = array();
    $product_attributes = $product->get_attributes();
    foreach ($product_attributes as $attribute) {
        $attributes[] = array(
            'name' => $attribute->get_name(),
            'options' => $attribute->get_options(),
            'visible' => $attribute->get_visible(),
            'variation' => $attribute->get_variation()
        );
    }
    
    // Create product slug from name
    $slug = sanitize_title($product->get_name());
    
    // Get stock status
    $stock_status = $product->get_stock_status();
    $stock_quantity = $product->get_stock_quantity();
    $manage_stock = $product->get_manage_stock();
    
    // Build product data
    $product_data = array(
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $slug,
        'sku' => $product->get_sku() ?: 'PROD-' . $product->get_id(),
        'description' => $product->get_description(),
        'short_description' => $product->get_short_description(),
        'price' => floatval($product->get_price()),
        'regular_price' => floatval($product->get_regular_price()),
        'sale_price' => $product->get_sale_price() ? floatval($product->get_sale_price()) : null,
        'currency' => get_woocommerce_currency(),
        'images' => $images,
        'categories' => $categories,
        'tags' => $tags,
        'attributes' => $attributes,
        'stock_status' => $stock_status,
        'stock_quantity' => $manage_stock ? ($stock_quantity !== null ? intval($stock_quantity) : null) : null,
        'manage_stock' => $manage_stock,
        'in_stock' => $product->is_in_stock(),
        'weight' => $product->get_weight() ? floatval($product->get_weight()) : null,
        'dimensions' => array(
            'length' => $product->get_length() ? floatval($product->get_length()) : null,
            'width' => $product->get_width() ? floatval($product->get_width()) : null,
            'height' => $product->get_height() ? floatval($product->get_height()) : null
        ),
        'featured' => $product->is_featured(),
        'type' => $product->get_type(),
        'date_created' => $product->get_date_created()->date('Y-m-d H:i:s'),
        'date_modified' => $product->get_date_modified()->date('Y-m-d H:i:s')
    );
    
    // Handle variable products - get variations
    if ($product->is_type('variable')) {
        $variations = $product->get_available_variations();
        $product_data['variations'] = array();
        
        foreach ($variations as $variation) {
            $variation_obj = wc_get_product($variation['variation_id']);
            if ($variation_obj) {
                $product_data['variations'][] = array(
                    'id' => $variation_obj->get_id(),
                    'sku' => $variation_obj->get_sku() ?: 'VAR-' . $variation_obj->get_id(),
                    'price' => floatval($variation_obj->get_price()),
                    'regular_price' => floatval($variation_obj->get_regular_price()),
                    'sale_price' => $variation_obj->get_sale_price() ? floatval($variation_obj->get_sale_price()) : null,
                    'stock_quantity' => $variation_obj->get_stock_quantity(),
                    'in_stock' => $variation_obj->is_in_stock(),
                    'attributes' => $variation_obj->get_variation_attributes(),
                    'image' => $variation_obj->get_image_id() ? wp_get_attachment_image_url($variation_obj->get_image_id(), 'full') : null
                );
            }
        }
    }
    
    $export_data[] = $product_data;
}

// Create output directory if it doesn't exist
$output_dir = __DIR__ . '/../dist/data';
if (!file_exists($output_dir)) {
    wp_mkdir_p($output_dir);
}

// Write JSON file
$json_file = $output_dir . '/products.json';
$json_output = json_encode($export_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (file_put_contents($json_file, $json_output)) {
    echo "Successfully exported " . count($export_data) . " products to: " . $json_file . "\n";
    echo "File size: " . number_format(filesize($json_file) / 1024, 2) . " KB\n";
} else {
    die("Error: Could not write to file: " . $json_file . "\n");
}

// Also create a summary file
$summary = array(
    'export_date' => date('Y-m-d H:i:s'),
    'total_products' => count($export_data),
    'products_by_type' => array(),
    'products_by_category' => array()
);

foreach ($export_data as $product) {
    // Count by type
    $type = $product['type'];
    if (!isset($summary['products_by_type'][$type])) {
        $summary['products_by_type'][$type] = 0;
    }
    $summary['products_by_type'][$type]++;
    
    // Count by category
    foreach ($product['categories'] as $category) {
        $cat_slug = $category['slug'];
        if (!isset($summary['products_by_category'][$cat_slug])) {
            $summary['products_by_category'][$cat_slug] = 0;
        }
        $summary['products_by_category'][$cat_slug]++;
    }
}

$summary_file = $output_dir . '/export-summary.json';
file_put_contents($summary_file, json_encode($summary, JSON_PRETTY_PRINT));

echo "Export summary saved to: " . $summary_file . "\n";

