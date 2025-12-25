<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package botanicals
 */
?>
		</div><!-- #content -->

		<footer id="colophon" class="site-footer" role="contentinfo">
			<h2 class="screen-reader-text"><?php _e( 'Footer Content', 'botanicals' ); ?></h2>
			<?php
			if ( is_active_sidebar( 'sidebar-2' ) ) {
				?>
				<div class="widget-area" role="complementary">
					<?php dynamic_sidebar( 'sidebar-2' ); ?>
				</div><!-- #secondary -->
			<?php
			}
			
			if ( has_nav_menu( 'social' ) ){ ?>
				<nav class="social-menu" role="navigation" aria-label="<?php _e( 'Social Media', 'botanicals' ); ?>">
					<?php wp_nav_menu( array( 'theme_location' => 'social',  'fallback_cb' => false, 'depth'=>1, 'link_before'=>'<span class="screen-reader-text">', 'link_after'=>'</span>') ); ?>
				</nav><!-- #social-menu -->
			<?php }; ?>
			
		</footer><!-- #colophon -->
	</div><!-- #page -->

	<?php wp_footer(); ?>
	<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/assets/js/bundle.js"></script>
</body>
</html>
