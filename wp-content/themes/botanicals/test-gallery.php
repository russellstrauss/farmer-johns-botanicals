<?php
/**
 * Test file to verify gallery template is working
 * Access this file directly to test: /wp-content/themes/botanicals/test-gallery.php
 * 
 * WARNING: Remove this file after testing!
 */

// Load WordPress
require_once( '../../../wp-load.php' );

// Get a product
$products = wc_get_products( array( 'limit' => 1 ) );
if ( empty( $products ) ) {
	die( 'No products found' );
}

$product = $products[0];
global $product;

echo '<h1>Testing Botanicals Gallery Template</h1>';
echo '<p>Product: ' . $product->get_name() . '</p>';

// Test the function
if ( ! function_exists( 'botanicals_get_product_gallery_images' ) ) {
	// Define it here for testing
	function botanicals_get_product_gallery_images( $product ) {
		$images = array();
		$attachment_ids = array();

		if ( $product->get_image_id() ) {
			$attachment_ids[] = $product->get_image_id();
		}

		$gallery_ids = $product->get_gallery_image_ids();
		if ( ! empty( $gallery_ids ) ) {
			$attachment_ids = array_merge( $attachment_ids, $gallery_ids );
		}

		$attachment_ids = array_unique( $attachment_ids );

		foreach ( $attachment_ids as $attachment_id ) {
			$full_image = wp_get_attachment_image_src( $attachment_id, 'full' );
			$thumbnail_image = wp_get_attachment_image_src( $attachment_id, 'woocommerce_thumbnail' );
			
			if ( ! $full_image ) {
				continue;
			}

			$images[] = array(
				'id'        => (int) $attachment_id,
				'full'      => esc_url( $full_image[0] ),
				'thumbnail' => $thumbnail_image ? esc_url( $thumbnail_image[0] ) : esc_url( $full_image[0] ),
				'alt'       => get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
				'name'      => get_the_title( $attachment_id ),
			);
		}

		if ( empty( $images ) ) {
			$placeholder = wc_placeholder_img_src( 'full' );
			$images[] = array(
				'id'        => 0,
				'full'      => esc_url( $placeholder ),
				'thumbnail' => esc_url( $placeholder ),
				'alt'       => __( 'Placeholder', 'woocommerce' ),
				'name'      => __( 'Placeholder', 'woocommerce' ),
			);
		}

		return $images;
	}
}

$gallery_images = botanicals_get_product_gallery_images( $product );
echo '<p>Images found: ' . count( $gallery_images ) . '</p>';
echo '<pre>' . print_r( $gallery_images, true ) . '</pre>';

// Test template location
$template = wc_locate_template( 'single-product/product-image.php' );
echo '<p>Template location: ' . $template . '</p>';
echo '<p>Template exists: ' . ( file_exists( $template ) ? 'Yes' : 'No' ) . '</p>';

// Try to load the template
echo '<h2>Template Output:</h2>';
echo '<div style="border: 2px solid red; padding: 20px;">';
if ( file_exists( $template ) ) {
	include( $template );
} else {
	echo '<p style="color: red;">Template file not found!</p>';
}
echo '</div>';

