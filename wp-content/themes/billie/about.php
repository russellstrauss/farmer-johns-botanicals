<?php
/**
 * Template Name: About
 *
 * @package botanicals
 */
?>

<?php get_header(); ?>

<div id="primary" class="about-page content-area">
	<main id="main" class="site-main" role="main">

		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

			<div class="entry-content">
				<div class="featured-image">
					<?php
					if ( has_post_thumbnail()){
						the_post_thumbnail();
					}
					?>
				</div>
				
				<div class="the-content">
					<div class="text-content">
						<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
						
						<?php
						if ( have_posts() ) {
							while ( have_posts() ) {
								the_post(); 
								the_content(); 
							}
						}
						?>	
					</div>
				</div>
							
				<?php
				wp_link_pages( array(
					'before' => '<div class="page-links">' . __( 'Pages:', 'botanicals' ),
					'after'  => '</div>',
				) );
				?>
			</div>
		</article>

	</main>
</div>

<?php get_sidebar(); ?>
<?php get_footer(); ?>
