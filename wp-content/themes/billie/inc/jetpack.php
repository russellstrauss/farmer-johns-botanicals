<?php
/**
 * Jetpack Compatibility File
 * See: http://jetpack.me/
 *
 * @package botanicals
 */

/**
 * Add theme support for Infinite Scroll.
 * See: http://jetpack.me/support/infinite-scroll/
 */
function botanicals_jetpack_setup() {
	add_theme_support( 'infinite-scroll', array(
		'container' => 'main',
		'footer'    => 'page',
	) );

	// Create custom image sizes for Site Logo and Testimonials.
	add_image_size( 'botanicals-jetpack-logo', 200, 200 );
	add_image_size( 'botanicals-jetpack-testimonial', 100, 100 );

	/*Support for Jetpack logo*/
	 add_theme_support( 'site-logo', array( 'size' => 'botanicals-jetpack-logo',) );

	/*Support for Jetpack featured-content*/ 
	add_theme_support( 'featured-content', array(
		'filter'     => 'botanicals_get_featured_posts',
		'max_posts'  =>6,
		'post_types' => array( 'post', 'page' ),
	) );
	
}
add_action( 'after_setup_theme', 'botanicals_jetpack_setup' );

function botanicals_the_site_logo() {
	if ( ! function_exists( 'jetpack_the_site_logo' ) ) {
		return;
	} else {
		jetpack_the_site_logo();
	}
}

function botanicals_get_featured_posts() {
    return apply_filters( 'botanicals_get_featured_posts', array() );
}

function botanicals_has_featured_posts( $minimum ) {
    if ( is_paged() )
        return false;
 
    $minimum = absint( $minimum );
    $featured_posts = apply_filters( 'botanicals_get_featured_posts', array() );
 
    if ( ! is_array( $featured_posts ) )
        return false;
 
    if ( $minimum > count( $featured_posts ) )
        return false;
 
    return true;
}

/*Remove the jetpack likes and sharing_display filter so that we can resposition them to our post footer.*/	
function botanicals_move_share() {
    remove_filter( 'the_content', 'sharing_display',19 );
    remove_filter( 'the_excerpt', 'sharing_display',19 );

    if ( class_exists( 'Jetpack_Likes' ) ) {
        remove_filter( 'the_content', array( Jetpack_Likes::init(), 'post_likes' ), 30, 1 );
    }
}
add_action( 'loop_start', 'botanicals_move_share' );

