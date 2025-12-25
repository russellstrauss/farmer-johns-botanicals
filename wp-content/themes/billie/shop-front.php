<?php
/**
 * Template Name: Shop Front
 *
 * @package botanicals
 */
?>

<?php get_header(); ?>

<div id="primary" class="about-page content-area">
	<main id="main" class="site-main" role="main">

		<div class="shop-front">
			
			<?php 
				$all_jewelry_image = get_field('all_jewelry_background_image');
				$dustins_jewelry_background_image = get_field('dustins_jewelry_background_image');
				$hillarys_jewelry_background_image = get_field('hillarys_jewelry_background_image');
			?>
			
			<a href="<?php echo get_site_url(); ?>/index.php/shop/">
				<div class="jewelry-page-link all" style="background-image: url(<?php echo $all_jewelry_image; ?>);">
					<div class="overlay"></div>
					<div class="text">all jewelry</div>
				</div>
			</a>
			
			<div class="profile-pics">
				<a href="<?php echo get_site_url(); ?>/index.php/product-tag/dustin/">
					<div class="jewelry-page-link dustin" style="background-image: url(<?php echo $dustins_jewelry_background_image; ?>);">
						<div class="overlay"></div>
						<div class="text">Dustin</div>
					</div>
				</a>
				
				<a href="<?php echo get_site_url(); ?>/index.php/product-tag/hillary/">
					<div class="jewelry-page-link hillary" style="background-image: url(<?php echo $hillarys_jewelry_background_image; ?>);">
						<div class="overlay"></div>
						<div class="text">Hillary</div>
					</div>
				</a>
			</div>
		</div>

	</main>
</div>

<?php get_footer(); ?>
