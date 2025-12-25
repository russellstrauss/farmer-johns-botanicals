<?php
/**
 * Sample implementation of the Custom Header feature
 * http://codex.wordpress.org/Custom_Headers
 *
 * @package botanicals
 */

/**
 * Set up the WordPress core custom header feature.
 *
 */
function botanicals_custom_header_setup() {
	add_theme_support( 'custom-header', apply_filters( 'botanicals_custom_header_args', array(
		'default-image'          => get_template_directory_uri() . '/assets/img/Black-Outline-Logo.png',
		'default-text-color'     => '000000',
		'flex-height'            => true,
		'flex-width'             => true,
		'width'                  => 2000,
		'height'                 => 600,
		'wp-head-callback'       => 'botanicals_customize_css',
		'admin-head-callback'    => 'botanicals_admin_header_style',
		'admin-preview-callback' => 'botanicals_admin_header_image',
	)
	) );

	register_default_headers( array(
		'flower' => array(
			'url'           => '%s/assets/img/Black-Outline-Logo.png',
			'thumbnail_url' => '%s/assets/img/Black-Outline-Logo.png',
			'description'   => __( 'Flower', 'botanicals' )
		)
	) );
}

add_action( 'after_setup_theme', 'botanicals_custom_header_setup' );

