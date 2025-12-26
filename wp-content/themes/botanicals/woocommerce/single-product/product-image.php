<?php
/**
 * Single Product Image - Vue Gallery Version
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/product-image.php.
 *
 * @see     https://woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 9.7.0
 */

use Automattic\WooCommerce\Enums\ProductType;

defined( 'ABSPATH' ) || exit;

// Debug: Log that template is being loaded
error_log( 'Botanicals: product-image.php template loaded' );

// Note: `wc_get_gallery_image_html` was added in WC 3.3.2 and did not exist prior. This check protects against theme overrides being used on older versions of WC.
if ( ! function_exists( 'wc_get_gallery_image_html' ) ) {
	error_log( 'Botanicals: wc_get_gallery_image_html function not found' );
	return;
}

global $product;

if ( ! $product ) {
	error_log( 'Botanicals: $product is not set' );
	return;
}

/**
 * Get product images for Vue gallery
 */
function botanicals_get_product_gallery_images( $product ) {
	$images = array();
	$attachment_ids = array();

	// Add featured image
	if ( $product->get_image_id() ) {
		$attachment_ids[] = $product->get_image_id();
	}

	// Add gallery images
	$gallery_ids = $product->get_gallery_image_ids();
	if ( ! empty( $gallery_ids ) ) {
		$attachment_ids = array_merge( $attachment_ids, $gallery_ids );
	}

	// Remove duplicates
	$attachment_ids = array_unique( $attachment_ids );

	// Build image data array
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

	// If no images, add placeholder
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

$columns           = apply_filters( 'woocommerce_product_thumbnails_columns', 4 );
$post_thumbnail_id = $product->get_image_id();
$wrapper_classes   = apply_filters(
	'woocommerce_single_product_image_gallery_classes',
	array(
		'woocommerce-product-gallery',
		'woocommerce-product-gallery--' . ( $post_thumbnail_id ? 'with-images' : 'without-images' ),
		'woocommerce-product-gallery--columns-' . absint( $columns ),
		'images',
	)
);

// Get product images for Vue gallery
$gallery_images = botanicals_get_product_gallery_images( $product );
error_log( 'Botanicals: Gallery images count: ' . count( $gallery_images ) );
?>

<!-- Botanicals Vue Gallery Template - Template is loading! -->
<div class="<?php echo esc_attr( implode( ' ', array_map( 'sanitize_html_class', $wrapper_classes ) ) ); ?>" data-columns="<?php echo esc_attr( $columns ); ?>" id="botanicals-gallery-wrapper">
	<!-- Gallery Container Start -->
	<div class="vue-product-gallery-container" 
		 data-images="<?php echo esc_attr( wp_json_encode( $gallery_images ) ); ?>"
		 data-enable-zoom="true"
		 data-enable-lightbox="true"
		 style="min-height: 400px; background: #f5f5f5; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center;">
		<!-- Vue component will mount here -->
		<noscript>
			<div style="padding: 20px; text-align: center; color: #666;">
				<p>Loading product gallery...</p>
				<p style="font-size: 12px;">If this message persists, JavaScript may be disabled.</p>
			</div>
		</noscript>
	</div>
	<!-- Gallery Container End -->
</div>
<!-- Botanicals Vue Gallery Template End -->

