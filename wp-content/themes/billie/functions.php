<?php

// Disable plugin notifications
remove_action('load-update-core.php','wp_update_plugins');
add_filter('pre_site_transient_update_plugins','__return_null');

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

/**
 * billie functions and definitions ================================== All Billie theme related methods below, default with the theme.
 *
 * @package billie
 */

/**
 * Set the content width based on the theme's design and stylesheet.
 */
if ( ! isset( $content_width )) {
	$content_width = 640; /* pixels */
}

if ( ! function_exists( 'billie_setup' )) :
/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function billie_setup() {
	/*
	 * Make theme available for translation.
	 * Translations can be filed in the /languages/ directory.
	 * If you're building a theme based on billie, use a find and replace
	 * to change 'billie' to the name of your theme in all the template files
	 */
	load_theme_textdomain( 'billie', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	add_theme_support( 'woocommerce' );		
	
	add_theme_support( 'jetpack-responsive-videos' ); 

	add_theme_support( 'jetpack-testimonial' );
	
	add_theme_support( 'jetpack-portfolio' );

	add_editor_style();
	
	add_theme_support( 'post-thumbnails' );	

	add_image_size( 'billie-featured-posts-thumb', 360, 300);
	
	add_theme_support( 'title-tag' );
	
	register_nav_menus( array(
		'header' => __( 'Primary Menu', 'billie' ),
		'social' => __( 'Social Menu', 'billie' ),
	));

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(	'search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));

}
endif; // billie_setup
add_action( 'after_setup_theme', 'billie_setup' );

/**
* billie_hide_title
*
* Unless the option is hidden in the customizer, display the site title (with link) in the primary menu.
*/

if ( get_theme_mod( 'billie_hide_title') =="" ){

	function billie_menu_title( $items, $args ) {
	    if( $args->theme_location == 'header' ){

	    	//$new_item       = array( '<li class="toptitle"><a href="' . esc_url( home_url( '/' )) .'" rel="home">' . get_bloginfo('name') .'</a></li>' );
	        $items          = preg_replace( '/<\/li>\s<li/', '</li>,<li',  $items );

	        $array_items    = explode( ',', $items );
	        array_splice( $array_items, 0, 0, $new_item ); // splice in at position 1
	        $items          = implode( '', $array_items );

	    }

	    return $items;
	}
	add_filter('wp_nav_menu_items','billie_menu_title', 10, 2);
}


/**
 * Register widget areas.
 *
 * @link http://codex.wordpress.org/Function_Reference/register_sidebar
 */
function billie_widgets_init() {

	register_sidebar( array(
		'name'          => __( 'Footer widget area', 'billie' ),
		'id'            => 'sidebar-2',
		'description'   => '',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	));
	
	register_sidebar( array(
		'name'          => __( 'Above Shop', 'billie' ),
		'id'            => 'above-shop-section',
		'description'   => __( 'This section will show above the products in the shop.', 'billie'),
		'before_widget' => '',
		'after_widget'  => '',
		'before_title'  => '',
		'after_title'   => '',
	));
	
	register_sidebar( array(
		'name'          => __( 'Return Policies', 'billie' ),
		'id'            => 'return-policies-section',
		'description'   => __( 'This section will show below the cart at check out.', 'billie'),
		'before_widget' => '',
		'after_widget'  => '',
		'before_title'  => '',
		'after_title'   => '',
	));

}
add_action( 'widgets_init', 'billie_widgets_init' );


if ( ! function_exists( 'billie_fonts_url' )) :
	function billie_fonts_url() {
		$fonts_url = '';
		$fonts     = array();
		$subsets   = 'latin,latin-ext';

		/* translators: If there are characters in your language that are not supported by Montserrat, translate this to 'off'. Do not translate into your own language. */
		if ( 'off' !== _x( 'on', 'Montserrat font: on or off', 'billie' )) {
			$fonts[] = 'Montserrat';
		}

		/* translators: To add an additional character subset specific to your language, translate this to 'greek', 'cyrillic', 'devanagari' or 'vietnamese'. Do not translate into your own language. */
		$subset = _x( 'no-subset', 'Add new subset (greek, cyrillic, devanagari, vietnamese)', 'billie' );

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
function billie_scripts() {
	wp_enqueue_style( 'billie-style', get_stylesheet_uri(), array('dashicons'));
	wp_enqueue_style( 'billie-fonts', billie_fonts_url(), array(), null );
	wp_enqueue_style( 'open-sans');

	wp_enqueue_script( 'billie-skip-link-focus-fix', get_template_directory_uri() . '/js/skip-link-focus-fix.js', array(), '20130115', true );
	wp_enqueue_script( 'billie-navigation', get_template_directory_uri() . '/js/navigation.js', array('jquery'), '20120206', true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' )) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'billie_scripts' );

/*
 * Enqueue styles for the setup help page.
 */ 

function billie_admin_scripts($hook) {
	if ( 'appearance_page_billie-theme' !== $hook ){
		return;
	}
	wp_enqueue_style( 'billie-admin-style', get_template_directory_uri() .'/admin.css');
}
add_action( 'admin_enqueue_scripts', 'billie_admin_scripts' );


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
add_filter( 'the_title', 'billie_post_title' );
function billie_post_title( $title ) {
	if ( $title == '' ) {
		return __( '(Untitled)', 'billie' );
	}else{
		return $title;
	}
}

 function billie_no_sidebars($classes) {
		 /* Are sidebars hidden on the frontpage?
	 *		Is the sidebar activated?
	 *		Add 'no-sidebar' to the $classes array
	*/
	if ( is_front_page() && ! is_active_sidebar( 'sidebar-3' ) || is_home() && ! is_active_sidebar( 'sidebar-3' )) {
		$classes[] = 'no-sidebar';
	}

	return $classes;
}
add_filter( 'body_class', 'billie_no_sidebars' );


function billie_customize_css() {
	echo '<style type="text/css">';
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
		background-size: <?php esc_attr_e( get_theme_mod('billie_header_bgsize', 'cover')); ?>;
		}

	<?php
	/* No header image has been chosen, check for background color: */
	}else{
		if( get_theme_mod('billie_header_bgcolor')){
			echo '.site-header { background:' . esc_attr( get_theme_mod('billie_header_bgcolor', '#9cc9c7')) . ';}';
			echo '#action:hover, #action:focus{text-shadow:none;}';
		}
	}

	//Call to Action text color
	if( get_theme_mod( 'billie_action_color' ) <> ' ') {
		echo '#action, #action a{ color:' . esc_attr( get_theme_mod('billie_action_color', '#000000')) . ';}';
	}

	//Call to Action background color
	if( get_theme_mod( 'billie_action_bgcolor' ) <> '') {
		echo '#action, #action a{background:#' . esc_attr( get_theme_mod('billie_action_bgcolor', 'none')) . ';}';
	}

	// If avatars are enabled, alter the css:
	if ( get_option( 'show_avatars' )) {
		echo '.comment-metadata{
			margin-left:70px;
			display:block;
			margin-top:-25px;
		}';
	}

	echo '</style>' . "\n";
}
add_action( 'wp_head', 'billie_customize_css');

/**
 * Disable srcset for missing thumbnails to prevent memory issues
 * Simply removes srcset attribute when thumbnails might be missing
 */
function billie_disable_srcset_for_missing_thumbnails( $sources, $size_array, $image_src, $image_meta, $attachment_id ) {
	// Only disable srcset on shop pages to avoid memory issues
	if ( ! function_exists( 'is_shop' ) || ! is_shop() ) {
		return $sources;
	}
	
	// Return empty array to disable srcset (WordPress will use the main image)
	return array();
}
add_filter( 'wp_calculate_image_srcset', 'billie_disable_srcset_for_missing_thumbnails', 999, 5 );