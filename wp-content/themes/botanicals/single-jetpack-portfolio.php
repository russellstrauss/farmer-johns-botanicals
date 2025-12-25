<?php
/**
 * The Template for displaying all single projects.
 *
 * @package botanicals
 */

get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

		<?php while ( have_posts() ) : the_post(); ?>

			<?php get_template_part( 'content', 'portfolio-single' ); ?>

			<?php the_post_navigation(); ?>

			<?php
				// If comments are open, load up the comment template
				if ( comments_open()) :
					comments_template();
				endif;
			?>						

		<?php endwhile; // end of the loop. ?>

		</main><!-- #main -->
	</div><!-- #primary -->
	
<?php get_footer(); ?>