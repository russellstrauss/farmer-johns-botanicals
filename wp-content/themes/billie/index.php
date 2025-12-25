<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
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
		<?php
		/*The front page sections should not display on the blog listing page*/
		if ( is_front_page() && is_home() ) {
			if( get_theme_mod('botanicals_top_section1') <>"" OR get_theme_mod('botanicals_top_section2') <>"" OR get_theme_mod('botanicals_top_section3') <>"" ) {
					$args = array('post_type' => 'page', 'orderby' => 'post__in', 'post__in' => array(get_theme_mod('botanicals_top_section1'), get_theme_mod('botanicals_top_section2'), get_theme_mod('botanicals_top_section3')));
	     		    query_posts($args);
					  while ( have_posts() ) : the_post();
						get_template_part( 'content', 'page' );
					  endwhile; 
				 wp_reset_query();
			}
		}
		
		if ( have_posts() ) : ?>
			<?php /* Start the Loop */ ?>
			<?php while ( have_posts() ) : the_post(); ?>

				<?php
					/* Include the Post-Format-specific template for the content.
					 * If you want to override this in a child theme, then include a file
					 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
					 */
					get_template_part( 'content', get_post_format() );
				?>
			<?php endwhile; ?>
			<?php the_posts_navigation(); ?>
		<?php endif; 

		/*The front page sections should not display on the blog listing page*/
		if ( is_front_page() && is_home() ) {
			if( get_theme_mod('botanicals_bottom_section1') <>"" OR get_theme_mod('botanicals_bottom_section2') <>"" OR get_theme_mod('botanicals_bottom_section3') <>"") {
					$args = array('post_type' => 'page', 'orderby' => 'post__in', 'post__in' => array(get_theme_mod('botanicals_bottom_section1'), get_theme_mod('botanicals_bottom_section2'), get_theme_mod('botanicals_bottom_section3')));
	     		    query_posts($args);
					  while ( have_posts() ) : the_post();
						get_template_part( 'content', 'page' );
					  endwhile; 
				 wp_reset_query();
			}
		}
		?>
		</main><!-- #main -->
	</div><!-- #primary -->
<?php 
if ( is_front_page() OR is_home() ) {
		get_sidebar('front');
}else{
	get_sidebar(); 
}
get_footer(); 
?>