<?php

// Disable plugin update notifications
remove_action('load-update-core.php','wp_update_plugins');
add_filter('pre_site_transient_update_plugins','__return_null');

// Disable theme update notifications
remove_action('load-update-core.php','wp_update_themes');
add_filter('pre_site_transient_update_themes','__return_null');

// Disable automatic theme updates
add_filter('auto_update_theme', '__return_false');
add_filter('themes_auto_update_enabled', '__return_false');

// Add Above shop widget to woocommerce template, third parameter is "priority"
add_action( 'woocommerce_before_shop_loop', 'add_product_categories');
function add_product_categories() {
	echo'<div class="above-shop-section">';
	dynamic_sidebar( 'above-shop-section' );
	echo '</div>';
}

// Add policies widget below cart
add_action('woocommerce_after_cart_table', 'add_policies_widget');
function add_policies_widget() {

	echo '<div class="policies">';
	dynamic_sidebar('return-policies-section');
	echo '</div>';
}

// Remove View cart button after adding to cart so that the user has to click on our custom checkout button
add_filter( 'wc_add_to_cart_message', 'custom_add_to_cart_message' );
function custom_add_to_cart_message() {
	global $woocommerce;

	$return_to  = get_permalink(woocommerce_get_page_id('shop'));
	$message    = sprintf('%s <a href="%1s" class="button wc-forwards">%2s</a>', __('Product successfully added to your cart.', 'woocommerce'), $return_to, __('Continue Shopping', 'woocommerce') );
	
	return $message;
}

// Remove Add to Cart button from product grid/loop
remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10 );

/**
 * Botanicals functions and definitions ================================== All Botanicals theme related methods below, default with the theme.
 *
 * @package botanicals
 */

/**
 * Set the content width based on the theme's design and stylesheet.
 */
if ( ! isset( $content_width )) {
	$content_width = 640; /* pixels */
}

if ( ! function_exists( 'botanicals_setup' )) :
/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function botanicals_setup() {
	/*
	 * Make theme available for translation.
	 * Translations can be filed in the /languages/ directory.
	 * If you're building a theme based on Botanicals, use a find and replace
	 * to change 'botanicals' to the name of your theme in all the template files
	 */
	load_theme_textdomain( 'botanicals', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
	
	add_theme_support( 'jetpack-responsive-videos' ); 

	add_theme_support( 'jetpack-testimonial' );
	
	add_theme_support( 'jetpack-portfolio' );

	add_editor_style();
	
	add_theme_support( 'post-thumbnails' );	

	add_image_size( 'botanicals-featured-posts-thumb', 360, 300);
	
	add_theme_support( 'title-tag' );
	
	register_nav_menus( array(
		'header' => __( 'Primary Menu', 'botanicals' ),
		'social' => __( 'Social Menu', 'botanicals' ),
	));

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(	'search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));

}
endif; // botanicals_setup
add_action( 'after_setup_theme', 'botanicals_setup' );

/**
* botanicals_hide_title
*
* Site title removed from markup - no longer displayed in navigation menu or header.
*/


/**
 * Register widget areas.
 *
 * @link http://codex.wordpress.org/Function_Reference/register_sidebar
 */
function botanicals_widgets_init() {

	register_sidebar( array(
		'name'          => __( 'Footer widget area', 'botanicals' ),
		'id'            => 'sidebar-2',
		'description'   => '',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	));
	
	register_sidebar( array(
		'name'          => __( 'Above Shop', 'botanicals' ),
		'id'            => 'above-shop-section',
		'description'   => __( 'This section will show above the products in the shop.', 'botanicals'),
		'before_widget' => '',
		'after_widget'  => '',
		'before_title'  => '',
		'after_title'   => '',
	));
	
	register_sidebar( array(
		'name'          => __( 'Return Policies', 'botanicals' ),
		'id'            => 'return-policies-section',
		'description'   => __( 'This section will show below the cart at check out.', 'botanicals'),
		'before_widget' => '',
		'after_widget'  => '',
		'before_title'  => '',
		'after_title'   => '',
	));

}
add_action( 'widgets_init', 'botanicals_widgets_init' );


if ( ! function_exists( 'botanicals_fonts_url' )) :
	function botanicals_fonts_url() {
		$fonts_url = '';
		$fonts     = array();
		$subsets   = 'latin,latin-ext';

		/* translators: If there are characters in your language that are not supported by Montserrat, translate this to 'off'. Do not translate into your own language. */
		if ( 'off' !== _x( 'on', 'Montserrat font: on or off', 'botanicals' )) {
			$fonts[] = 'Montserrat';
		}

		/* translators: To add an additional character subset specific to your language, translate this to 'greek', 'cyrillic', 'devanagari' or 'vietnamese'. Do not translate into your own language. */
		$subset = _x( 'no-subset', 'Add new subset (greek, cyrillic, devanagari, vietnamese)', 'botanicals' );

		if ( 'cyrillic' == $subset ) {
			$subsets .= ',cyrillic,cyrillic-ext';
		} elseif ( 'greek' == $subset ) {
			$subsets .= ',greek,greek-ext';
		} elseif ( 'devanagari' == $subset ) {
			$subsets .= ',devanagari';
		} elseif ( 'vietnamese' == $subset ) {
			$subsets .= ',vietnamese';
		}

		if ( $fonts ) {
			$fonts_url = add_query_arg( array(
				'family' => urlencode( implode( '|', $fonts )),
				'subset' => urlencode( $subsets ),
			), '//fonts.googleapis.com/css' );
		}

		return $fonts_url;
	}
endif;

/**
 * Enqueue scripts and styles.
 */
function botanicals_scripts() {
	wp_enqueue_style( 'botanicals-style', get_stylesheet_uri(), array('dashicons'));
	wp_enqueue_style( 'botanicals-fonts', botanicals_fonts_url(), array(), null );
	wp_enqueue_style( 'open-sans');

	wp_enqueue_script( 'botanicals-skip-link-focus-fix', get_template_directory_uri() . '/js/skip-link-focus-fix.js', array(), '20130115', true );
	wp_enqueue_script( 'botanicals-navigation', get_template_directory_uri() . '/js/navigation.js', array('jquery'), '20120206', true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' )) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'botanicals_scripts' );

/*
 * Enqueue styles for the setup help page.
 */ 

function botanicals_admin_scripts($hook) {
	if ( 'appearance_page_botanicals-theme' !== $hook ){
		return;
	}
	wp_enqueue_style( 'botanicals-admin-style', get_template_directory_uri() .'/admin.css');
}
add_action( 'admin_enqueue_scripts', 'botanicals_admin_scripts' );


/**
 * Custom header for this theme.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Custom functions that act independently of the theme templates.
 */
require get_template_directory() . '/inc/extras.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
require get_template_directory() . '/inc/jetpack.php';

/**
 * Setup help
 */
require get_template_directory() . '/documentation.php';


/* Add a title to posts that are missing titles */
add_filter( 'the_title', 'botanicals_post_title' );
function botanicals_post_title( $title ) {
	if ( $title == '' ) {
		return __( '(Untitled)', 'botanicals' );
	}else{
		return $title;
	}
}

 function botanicals_no_sidebars($classes) {
		 /* Are sidebars hidden on the frontpage?
	 *		Is the sidebar activated?
	 *		Add 'no-sidebar' to the $classes array
	*/
	if ( is_front_page() && ! is_active_sidebar( 'sidebar-3' ) || is_home() && ! is_active_sidebar( 'sidebar-3' )) {
		$classes[] = 'no-sidebar';
	}

	return $classes;
}
add_filter( 'body_class', 'botanicals_no_sidebars' );


function botanicals_customize_css() {
	echo '<style type="text/css" id="botanicals-custom-css">';
	 if ( is_admin_bar_showing()) {
	 	?>
	 	.main-navigation{top:32px;}

	 	@media screen and ( max-width: 782px ) {
			.main-navigation{top:46px;}
		}

		@media screen and ( max-width: 600px ) {
			.main-navigation{top:0px;}
		}

	<?php
	 }
	 
	echo '.site-title, .site-description{color:#' . get_header_textcolor() . ';} ';

	$header_image = get_header_image();
	if ( ! empty( $header_image )) {
	?>
		.site-header {
		background-size: <?php esc_attr_e( get_theme_mod('botanicals_header_bgsize', 'cover')); ?>;
		}

	<?php
	/* No header image has been chosen, check for background color: */
	}else{
		if( get_theme_mod('botanicals_header_bgcolor')){
			echo '.site-header { background:' . esc_attr( get_theme_mod('botanicals_header_bgcolor', '#9cc9c7')) . ';}';
			echo '#action:hover, #action:focus{text-shadow:none;}';
		}
	}

	//Call to Action text color
	if( get_theme_mod( 'botanicals_action_color' ) <> ' ') {
		echo '#action, #action a{ color:' . esc_attr( get_theme_mod('botanicals_action_color', '#000000')) . ';}';
	}

	//Call to Action background color
	if( get_theme_mod( 'botanicals_action_bgcolor' ) <> '') {
		echo '#action, #action a{background:#' . esc_attr( get_theme_mod('botanicals_action_bgcolor', 'none')) . ';}';
	}

	// If avatars are enabled, alter the css:
	if ( get_option( 'show_avatars' )) {
		echo '.comment-metadata{
			margin-left:70px;
			display:block;
			margin-top:-25px;
		}';
	}

	// WooCommerce Product Gallery - Custom arrow icons
	echo '/* WooCommerce Gallery Arrows */
	.woocommerce-product-gallery .flex-direction-nav .flex-prev,
	.woocommerce-product-gallery .flex-direction-nav .flex-next {
		background-size: 50px;
		background-repeat: no-repeat;
		opacity: .5;
		background-color: transparent;
	}
	.woocommerce-product-gallery .flex-direction-nav .flex-prev:hover,
	.woocommerce-product-gallery .flex-direction-nav .flex-next:hover {
		opacity: 1;
	}
	.woocommerce-product-gallery .flex-direction-nav .flex-prev {
		background-image: url(' . get_template_directory_uri() . '/assets/img/caret-left.svg);
		background-position: left 20px center;
	}
	.woocommerce-product-gallery .flex-direction-nav .flex-next {
		background-image: url(' . get_template_directory_uri() . '/assets/img/caret-right.svg);
		background-position: right 20px center;
	}
	.woocommerce-product-gallery .flex-direction-nav .flex-prev:before,
	.woocommerce-product-gallery .flex-direction-nav .flex-next:before {
		content: none;
	}
	/* PhotoSwipe Lightbox Arrows */
	button.pswp__button--arrow--left {
		background-image: url(' . get_template_directory_uri() . '/assets/img/caret-left.svg) !important;
		background-size: 50px !important;
		background-position: left 20px center !important;
		background-repeat: no-repeat !important;
	}
	button.pswp__button--arrow--right {
		background-image: url(' . get_template_directory_uri() . '/assets/img/caret-right.svg) !important;
		background-size: 50px !important;
		background-position: right 20px center !important;
		background-repeat: no-repeat !important;
	}
	button.pswp__button--arrow--left:before,
	button.pswp__button--arrow--right:before {
		content: none !important;
		background: none !important;
	}
	@media (max-width: 767px) {
		.woocommerce-product-gallery .flex-direction-nav .flex-prev,
		.woocommerce-product-gallery .flex-direction-nav .flex-next {
			background-size: 25px;
		}
		.woocommerce-product-gallery .flex-direction-nav .flex-prev {
			background-position: left 10px center;
		}
		.woocommerce-product-gallery .flex-direction-nav .flex-next {
			background-position: right 10px center;
		}
		button.pswp__button--arrow--left,
		button.pswp__button--arrow--right {
			background-size: 25px !important;
		}
		button.pswp__button--arrow--left {
			background-position: left 10px center !important;
		}
		button.pswp__button--arrow--right {
			background-position: right 10px center !important;
		}
	}
	
	/* Product Page Add to Cart Button Styling */
	.jewelry-shop div.product button.button.alt.single_add_to_cart_button,
	.jewelry-shop div.product form.cart button.button.alt.single_add_to_cart_button,
	.woocommerce div.product form.cart button.button.alt.single_add_to_cart_button {
		background-color: black !important;
		color: #fff !important;
		font-size: 16px !important;
		display: block !important;
		padding: 20px 50px !important;
		border: 1px solid black !important;
		transition: all 250ms ease !important;
		text-align: center !important;
		cursor: pointer !important;
		width: auto !important;
	}
	.jewelry-shop div.product button.button.alt.single_add_to_cart_button:hover,
	.jewelry-shop div.product form.cart button.button.alt.single_add_to_cart_button:hover,
	.woocommerce div.product form.cart button.button.alt.single_add_to_cart_button:hover {
		background-color: white !important;
		color: black !important;
	}
	@media (max-width: 767px) {
		.jewelry-shop div.product button.button.alt.single_add_to_cart_button,
		.jewelry-shop div.product form.cart button.button.alt.single_add_to_cart_button,
		.woocommerce div.product form.cart button.button.alt.single_add_to_cart_button {
			width: 100% !important;
		}
	}
	
	/* Hide Add to Cart button from product grid/loop */
	.woocommerce ul.products li.product .add_to_cart_button,
	.jewelry-shop ul.products li.product .add_to_cart_button,
	.woocommerce ul.products li.product a.add_to_cart_button,
	.jewelry-shop ul.products li.product a.add_to_cart_button,
	.woocommerce ul.products li.product button.add_to_cart_button,
	.jewelry-shop ul.products li.product button.add_to_cart_button {
		display: none !important;
	}
	
	/* Product Categories Styling */
	.product-categories,
	.above-shop-section .product-categories,
	.above-shop-section .widget .product-categories,
	.above-shop-section ul.product-categories,
	.jewelry-shop .above-shop-section .product-categories,
	.jewelry-shop .above-shop-section .widget .product-categories,
	.woocommerce .above-shop-section .product-categories,
	.woocommerce .above-shop-section .widget .product-categories {
		padding-left: 0 !important;
		text-align: center !important;
		margin: 0 0 20px 0 !important;
		list-style: none !important;
	}
	.product-categories li,
	.above-shop-section .product-categories li,
	.jewelry-shop .above-shop-section .product-categories li,
	.woocommerce .above-shop-section .product-categories li {
		display: inline-block !important;
		margin: 0 20px !important;
		list-style: none !important;
	}
	.product-categories .swiper-slide,
	.above-shop-section .product-categories .swiper-slide,
	.jewelry-shop .above-shop-section .product-categories .swiper-slide,
	.woocommerce .above-shop-section .product-categories .swiper-slide {
		display: inline !important;
		margin: 10px !important;
	}
	.product-categories .swiper-slide a,
	.above-shop-section .product-categories .swiper-slide a,
	.jewelry-shop .above-shop-section .product-categories .swiper-slide a,
	.woocommerce .above-shop-section .product-categories .swiper-slide a {
		text-decoration: none !important;
	}
	.product-categories a,
	.above-shop-section .product-categories a,
	.jewelry-shop .above-shop-section .product-categories a,
	.woocommerce .above-shop-section .product-categories a {
		text-decoration: none !important;
	}
	@media (max-width: 767px) {
		.product-categories,
		.above-shop-section .product-categories,
		.jewelry-shop .above-shop-section .product-categories,
		.woocommerce .above-shop-section .product-categories {
			display: flex !important;
			flex-wrap: wrap !important;
			justify-content: center !important;
		}
		.product-categories .swiper-slide,
		.above-shop-section .product-categories .swiper-slide,
		.jewelry-shop .above-shop-section .product-categories .swiper-slide,
		.woocommerce .above-shop-section .product-categories .swiper-slide {
			display: block !important;
			text-align: center !important;
			margin: 0 !important;
		}
		.product-categories .swiper-slide a,
		.above-shop-section .product-categories .swiper-slide a,
		.jewelry-shop .above-shop-section .product-categories .swiper-slide a,
		.woocommerce .above-shop-section .product-categories .swiper-slide a {
			padding: 10px 12px !important;
			display: block !important;
			top: 50% !important;
			position: relative !important;
			transform: translateY(-50%) !important;
		}
	}';

	echo '</style>' . "\n";
}
add_action( 'wp_head', 'botanicals_customize_css', 999);

/**
 * Disable srcset for missing thumbnails to prevent memory issues
 * Simply removes srcset attribute when thumbnails might be missing
 */
function botanicals_disable_srcset_for_missing_thumbnails( $sources, $size_array, $image_src, $image_meta, $attachment_id ) {
	// Only disable srcset on shop pages to avoid memory issues
	if ( ! function_exists( 'is_shop' ) || ! is_shop() ) {
		return $sources;
	}
	
	// Return empty array to disable srcset (WordPress will use the main image)
	return array();
}
add_filter( 'wp_calculate_image_srcset', 'botanicals_disable_srcset_for_missing_thumbnails', 999, 5 );

/**
 * Completely remove WooCommerce Legacy REST API and prevent auto-reinstallation
 */
add_action( 'init', 'remove_woocommerce_legacy_rest_api_completely', 999 );
function remove_woocommerce_legacy_rest_api_completely() {
	global $wpdb;
	
	$plugin_path = 'woocommerce-legacy-rest-api/woocommerce-legacy-rest-api.php';
	$plugin_dir = WP_PLUGIN_DIR . '/woocommerce-legacy-rest-api';
	
	// Delete legacy webhooks (webhooks with api_version < 1)
	$legacy_webhook_ids = $wpdb->get_col( "SELECT webhook_id FROM {$wpdb->prefix}wc_webhooks WHERE `api_version` < 1" );
	if ( ! empty( $legacy_webhook_ids ) ) {
		foreach ( $legacy_webhook_ids as $webhook_id ) {
			$webhook = wc_get_webhook( $webhook_id );
			if ( $webhook ) {
				$webhook->delete( true );
			}
		}
		// Clear webhook cache
		wp_cache_delete( WC_Cache_Helper::get_cache_prefix( 'webhooks' ) . 'legacy_count', 'webhooks' );
	}
	
	// Ensure the API option is set to 'no'
	update_option( 'woocommerce_api_enabled', 'no' );
	
	// Remove from active plugins list
	$active_plugins = get_option( 'active_plugins', array() );
	$key = array_search( $plugin_path, $active_plugins, true );
	if ( $key !== false ) {
		unset( $active_plugins[ $key ] );
		update_option( 'active_plugins', array_values( $active_plugins ) );
	}
	
	// Delete the plugin directory if it exists (in case it was reinstalled)
	if ( is_dir( $plugin_dir ) ) {
		// Recursive directory deletion
		$files = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $plugin_dir, RecursiveDirectoryIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		
		foreach ( $files as $fileinfo ) {
			$todo = ( $fileinfo->isDir() ? 'rmdir' : 'unlink' );
			@$todo( $fileinfo->getRealPath() );
		}
		@rmdir( $plugin_dir );
	}
	
	// Remove admin notices
	if ( class_exists( 'WC_Admin_Notices' ) ) {
		$notice_names = array(
			'woocommerce_legacy_rest_api_plugin_activated',
			'woocommerce_legacy_rest_api_plugin_activation_failed',
			'woocommerce_legacy_rest_api_plugin_install_failed',
		);
		
		foreach ( $notice_names as $notice_name ) {
			WC_Admin_Notices::remove_notice( $notice_name, true );
			// Also delete the custom notice option from database
			delete_option( 'woocommerce_admin_notice_' . $notice_name );
		}
	}
	
	flush_rewrite_rules();
}

/**
 * Prevent WooCommerce from auto-installing the Legacy REST API plugin
 */
add_filter( 'woocommerce_skip_legacy_rest_api_plugin_auto_install', '__return_true', 999 );