<?php get_header(); ?>

<?php while ( have_posts() ) : the_post(); ?>

	<?php the_content(); ?>
	This is page.php

<?php endwhile; ?>

