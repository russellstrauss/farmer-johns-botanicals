<?php 
function billie_docs_menu() {
	add_theme_page( __('Billie Setup Help', 'billie'), __('Billie Setup Help', 'billie'), 'edit_theme_options', 'billie-theme', 'billie_docs');
}
add_action('admin_menu', 'billie_docs_menu');

function billie_docs() {

?>

<h1 class="doc-title"><?php _e('Billie Setup Help', 'billie'); ?></h1>
<div class="doc-thanks">
<b><?php _e('Thank you for downloading and trying out Billie!', 'billie'); ?></b><br><br>
<?php printf( __('If you like the theme, please review it on <a href="%s">WordPress.org</a>', 'billie'), esc_url('https://wordpress.org/support/view/theme-reviews/billie') );?><br>

<b><?php printf( __('If you have any questions, accessibility issues or feature requests for this theme, please visit <a href="%s">http://wptema.se/Billie</a>.', 'billie'), esc_url('http://wptema.se/Billie') ); ?></b><br>
<?php _e('Thank you to everyone who has contributed with ideas and bug reports so far! Your feedback is essential for the future developement of the theme.', 'billie'); ?>
</div>

	<ul class="doc-menu">
		<li><a href="#billie-menus"><?php _e('Menus','billie' ); ?></a></li>
		<li><a href="#billie-widget"><?php _e('Widget areas','billie' ); ?></a></li>
		<li><a href="#billie-front"><?php _e('Front page','billie' ); ?></a></li>
		<li><a href="#billie-advanced"><?php _e('Advanced settings','billie' ); ?></a></li>
		<li><a href="#billie-plugins"><?php _e('Plugins','billie' ); ?></a></li>
	</ul>

	<div class="doc-box" id="billie-menus">
		<h3><?php _e('Menus','billie' ); ?></h3>
		<?php _e('This theme has two optional menu locations, the <b>Primary menu</b> and the <b>Social menu</b>.','billie' ); ?><br><br>
			
		<b><?php _e('The Primary menu','billie' ); ?></b> <?php _e('is fixed at the top of the website and shows two menu levels. <br>
		This menu will collapse on smaller screens, and can then be opened and closed by a menu button. It can also be closed with the Esc key.','billie' ); ?><br>
		<?php _e( 'A one line menu is recommended, or the menu will overlap your content. Use submenus instead.','billie' ); ?><br><br>

		<?php _e('<b>The social menu</b> is at the bottom of the page and shows logos of the social networks of your choice. It does not display any text,<br> but has additional information for screen readers.','billie' ); ?>
		<?php _e('The icon will be added automatically, all you need to do is add a link to your menu.','billie' ); ?><br><br>
			
		<b><?php _e('Advanced','billie' ); ?></b><br>
		<?php _e('By default, the primary meny also shows the site title. You can hide this feature under the Advanced settings tab in the Customizer.','billie' ); ?>
	</div>

	<div class="doc-box" id="billie-widgets">
		<h3><?php _e('Widget areas','billie' ); ?></h3>
		<?php _e('The theme has two sidebars, one for the front page and one for posts, that can hold <b>any number of widgets</b>. The footer widget area is shown on all pages.','billie' ); ?><br>
		<?php _e('There is also an additional widget area in the footer below the social menu, where you can place a text widget and add your copyright text.','billie' );?> 
	</div>

	<div class="doc-box" id="billie-front">
			<h3><?php _e('Frontpage','billie' ); ?></h3>
			<?php _e('The standard front page has the following features:','billie' ); ?><br>
			<?php _e('<b>Site title and tagline:</b> You will find an option to hide or change the color of your header text in the customizer.','billie' ); ?><br>
			<?php _e('<b>Call to action:</b> The Call to Action is a great way to get your visitors attention. In the customizer you can:','billie' ); ?>
			<ul>
				<li><?php _e('Add your own text','billie' ); ?></li>
				<li><?php _e('Add a link','billie' )?></li>		
				<li><?php _e('Change colors','billie' )?></li>
				<li><?php _e('Hide the button','billie' ); ?></li>		
			</ul>
			<?php _e('<b>Header Background:</b> You can change the background image or background color in the customizer.','billie' )?> <br>
			<?php _e('<b>Search form:</b> You can hide the search form under the Advanced setting in the customizer.','billie' )?> <br>
			<h3><?php _e('Custom Frontpage','billie' )?></h3>
			<?php _e('<b>Page sections:</b> Page sections are a great way to display your shortcodes, testimonials, pricing tables, contact information and similar.', 'billie' ); ?><br>
			<?php _e('The two page sections can display up to 3 pages each. Pages in the top section are displayed above the blog content, and pages in the bottom section are displayed below.','billie' )?><br>
			<?php _e('You can also show your page sections together with a static front page, using the <i>Static and Sections</i> page template.','billie' )?><br>

	</div>

	<div class="doc-box" id="billie-advanced">
		<h3><?php _e('Advanced settings','billie' ); ?></h3>
		<?php _e('Under the Advanced settings tab in the customizer you will find the following options:','billie' )?>
		<ul>
			<li><?php _e('Hide the meta information. -This will hide the categories.','billie' )?></li>
			<li><?php _e('Hide the author, post date and tag information.','billie' )?></li>
			<li><?php _e('Hide the search form in the header.','billie' )?></li>
			<li><?php _e('Hide the Site title in the header menu.','billie' )?></li>
		</ul>
	</div>

	<div class="doc-box" id="billie-plugins">
		<h3><?php _e('Plugins','billie' ); ?></h3>
		<?php _e('Billie has been tested with and style has been added for the following plugins:', 'billie' ); ?>
		<ul>
			<li><b><?php _e('Woocommerce','billie' )?></b></li>
			<li><b><?php _e('bbPress','billie' )?></b></li>
			<li><b><?php _e('Jetpack','billie' )?></b><br><?php _e(' Note: Not all of Jetpacks modules are accessibe, and some uses iframes. I have increased the contrast of some of the modules.','billie' )?></li>
				<?php _e('Recommended modules:','billie' )?><br>
				<ul>
					<li><b><?php _e('Featured content','billie' )?></b><br>
						<?php _e('-Once Jetpack has been activated, you can select up to six posts or pages as a front page feature. Chose a tag and add it to your posts to seperate them from the rest.<br>
						You can also choose a label for the posts in your featured section. Featured images are optional and the recommended image size is 360x300 pixels.','billie' )?><br>
					</li>
					<li><b><?php _e('Custom Content Type: Portfolio','billie' )?></b><br>
						<?php _e('Billie also supports Jetpack','billie' )?> 
						<b><?php _e('Portfolios','billie' )?></b>. <a href="<?php echo 'http://en.support.wordpress.com/portfolios/'; ?>"><i><?php _e('Read more about how to setup your Portfolio on Jetpacks support site.','billie' )?></i></a><br><br>
					</li>

					<li><b><?php _e('Custom Content Type: Testimonials','billie' )?></b><br>
						<?php _e('Billie also supports Jetpack','billie' )?> <b><?php _e('Testimonials','billie' )?></b>. <br>
						<?php _e('<b>Tip:</b> I recommend creating a page and adding this shortcode, and then including the page as a front page section.','billie' )?> <br> &nbsp; [testimonials columns=3 showposts=3]<br>
						<a href="<?php echo 'https://en.support.wordpress.com/testimonials-shortcode/'; ?>"><i><?php _e('Read more about how to setup your Testimonials on Jetpacks support site.','billie' )?></i></a><br><br>		
					</li>

					<li><b><?php _e('Sharing','billie' )?></b><br>
						<?php _e('-If you activate Jetpack sharing, your buttons will be displayed below the meta information.','billie' )?><br>
					</li>
					<li><b><?php _e('Contact Form','billie' )?></b></li>
					<li><?php _e('<b>Site icon</b> -Use this module to add a favicon to your site.','billie' )?></li>
					<li><?php _e('<b>Site logo</b> -Once Jetpack has been activated, you can add a logo above your Site title on the front page. You will find this setting in the customizer.','billie' )?></li>
				</ul>
		</ul>
		</ul>
	</div>
<?php
}

?>