<?php
/**
 * The header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="content">
 *
 * @package botanicals
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width" />
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<?php wp_head(); ?>
	<link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600" rel="stylesheet">
</head>

<body <?php body_class(); ?>>

<div id="page" class="hfeed site">
	<a class="skip-link screen-reader-text" href="#content"><?php _e( 'Skip to content', 'botanicals' ); ?></a>
	<header id="masthead" class="site-header" role="banner">

	<?php if ( has_nav_menu( 'header' )  ) {
	?>
		<nav id="site-navigation" class="main-navigation" role="navigation">
			<!-- <button class="menu-toggle" aria-controls="menu" aria-expanded="false"><span class="screen-reader-text"><?php //_e( 'Main Menu', 'botanicals' ); ?></span></button> -->
			<?php wp_nav_menu( array( 'theme_location' => 'header', 'fallback_cb' => false, 'depth'=>2 ) );  ?>
		
			<button class="menu-toggle hamburger hamburger--squeeze" type="button">
				<span class="hamburger-box">
					<span class="hamburger-inner"></span>
				</span>
			</button>
		</nav>
	<?php
	}
	?>
	<div class="site-branding">	
		<?php //botanicals_the_site_logo(); ?>
		
		<a href="<?php echo get_site_url(); ?>">
			<img id="site-logo" src="<?php header_image(); ?>" alt="logo" />
		</a>
		
		<?php if (display_header_text() ) {	?>
			<?php if (get_bloginfo('description') <> '') {	?>
				<div class="site-description"><?php bloginfo( 'description' ); ?></div>
			<?php }	?>
		<?php } ?>

		<?php if( !get_theme_mod( 'botanicals_hide_action' ) ) {
					if( get_theme_mod( 'botanicals_action_text' ) ) {	
						echo '<div id="action">';
						if( get_theme_mod( 'botanicals_action_link' ) ) {
							echo '<a href="' . esc_url( get_theme_mod( 'botanicals_action_link' ) ) .'">';
						}
						echo esc_html( get_theme_mod( 'botanicals_action_text' ) );
						if( get_theme_mod( 'botanicals_action_link' )) {
							echo '</a>';
						}
						echo '</div>';
					}else{
						if ( is_user_logged_in() ) {
							echo '<div id="action">';
							echo '<a href="' . esc_url( home_url( '/wp-admin/customize.php' ) ) . '">' . __("Click here to setup your Call to Action", 'botanicals') . '</a>';
							echo '</div>';
						}
					}
					?>
			<?php
			}
			// Search form hidden - removed per request
			// if ( !get_theme_mod('botanicals_hide_search') ){
			// 	get_search_form();
			// }
			?>

		</div><!-- .site-branding -->
			
		<?php
		if (WC()->cart->get_cart_contents_count() > 0 && !is_cart() && !is_checkout()) {
			
			echo '<div class="fjb-checkout">';
				echo '<a href="' . get_permalink( wc_get_page_id( 'cart' ) ) . '">';
					echo '<span>checkout ' . sprintf ( _n( '(%d)', '(%d)', WC()->cart->get_cart_contents_count() ), WC()->cart->get_cart_contents_count() ) . '</span>';
					echo '<div class="bling-shark-container">';
						echo '<div class="bling-shark"></div>';
						echo '<div class="bling-shark-hover"></div>';
					echo '</div>';
				echo '</a>';
			echo '</div>';
		} ?>
	</header><!-- #masthead -->
	
		
	<div class="site-content">