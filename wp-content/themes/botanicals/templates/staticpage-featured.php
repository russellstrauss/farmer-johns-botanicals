<?php
/**
 * Template Name: Static and Featured
 * 
 * Description: A Page Template that displays your static frontpage and featured content, but no sidebar
 * @package botanicals
 */

get_header(); 
	if ( botanicals_has_featured_posts( 1 ) ) {

		echo '<section class="featured-wrap">';
		
			$featured_posts = botanicals_get_featured_posts();
			foreach ( (array) $featured_posts as $order => $post ) :
				setup_postdata( $post );

				echo '<div class="featured-post">';

			if ( has_post_thumbnail() )	{
				$background = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'botanicals-featured-posts-thumb' );

				echo '<div class="featured-inner" style="background: url(' . $background[0] .');">';
			}else{
				echo '<div class="featured-inner" style="background: ' . esc_attr( get_theme_mod('botanicals_header_bgcolor', '#9cc9c7') ) . ';">';
			}
				
				echo '<div class="post-header">';
				the_title( sprintf( '<h2><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' ); 
				echo '</div>
					<span class="featured-text">';

						echo get_theme_mod('botanicals_featured_headline', __('Featured','botanicals'));

				echo '<span class="tag-list">';

							$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
							$time_string = sprintf( $time_string,
								esc_attr( get_the_date( 'c' ) ),
								esc_html( get_the_date() )
							);

							$posted_on = $time_string;
							echo $posted_on;

						echo '</span>
					</span>
				</div></div>';

			endforeach;	 
			
			wp_reset_postdata();
		 	
			echo '</section>';
	}
	?>
	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

				<?php
					// If comments are open , load up the comment template
					if ( comments_open()) :
						comments_template();
					endif;
				?>

			<?php endwhile; // end of the loop. ?>

		</main><!-- #main -->
	</div><!-- #primary -->

<?php get_footer(); ?>
