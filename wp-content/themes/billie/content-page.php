<?php
/**
 * The template used for displaying page content in page.php
 *
 * @package botanicals
 */
?>

<?php get_header(); ?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
		<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
	</header>

	<div class="entry-content">
		<?php 
		if ( has_post_thumbnail()){
			the_post_thumbnail();
		} ?>
		
		<div class="the-content">
			<?php the_content(); ?>
		</div>
		
		<?php wp_link_pages( array(
			'before' => '<div class="page-links">' . __( 'Pages:', 'botanicals' ),
			'after'  => '</div>',
		) );
		?>
	</div>
</article>

<?php get_sidebar(); ?>
<?php get_footer(); ?>
