<?php 
function botanicals_docs_menu() {
	add_theme_page( __('Botanicals Setup Help', 'botanicals'), __('Botanicals Setup Help', 'botanicals'), 'edit_theme_options', 'botanicals-theme', 'botanicals_docs');
}
add_action('admin_menu', 'botanicals_docs_menu');

function botanicals_docs() {

?>

<h1 class="doc-title"><?php _e('Botanicals Setup Help', 'botanicals'); ?></h1>
<div class="doc-thanks">
<b><?php _e('Thank you for downloading and trying out Botanicals!', 'botanicals'); ?></b><br><br>
<?php printf( __('If you like the theme, please review it on <a href="%s">WordPress.org</a>', 'botanicals'), esc_url('https://wordpress.org/support/view/theme-reviews/botanicals') );?><br>

<b><?php printf( __('If you have any questions, accessibility issues or feature requests for this theme, please visit <a href="%s">http://wptema.se/Botanicals</a>.', 'botanicals'), esc_url('http://wptema.se/Botanicals') ); ?></b><br>
<?php _e('Thank you to everyone who has contributed with ideas and bug reports so far! Your feedback is essential for the future developement of the theme.', 'botanicals'); ?>
</div>

	<ul class="doc-menu">
		<li><a href="#botanicals-menus"><?php _e('Menus','botanicals' ); ?></a></li>
		<li><a href="#botanicals-widget"><?php _e('Widget areas','botanicals' ); ?></a></li>
		<li><a href="#botanicals-front"><?php _e('Front page','botanicals' ); ?></a></li>
		<li><a href="#botanicals-advanced"><?php _e('Advanced settings','botanicals' ); ?></a></li>
		<li><a href="#botanicals-plugins"><?php _e('Plugins','botanicals' ); ?></a></li>
	</ul>

	<div class="doc-box" id="botanicals-menus">
		<h3><?php _e('Menus','botanicals' ); ?></h3>
		<?php _e('This theme has two optional menu locations, the <b>Primary menu</b> and the <b>Social menu</b>.','botanicals' ); ?><br><br>
			
		<b><?php _e('The Primary menu','botanicals' ); ?></b> <?php _e('is fixed at the top of the website and shows two menu levels. <br>
		This menu will collapse on smaller screens, and can then be opened and closed by a menu button. It can also be closed with the Esc key.','botanicals' ); ?><br>
		<?php _e( 'A one line menu is recommended, or the menu will overlap your content. Use submenus instead.','botanicals' ); ?><br><br>

		<?php _e('<b>The social menu</b> is at the bottom of the page and shows logos of the social networks of your choice. It does not display any text,<br> but has additional information for screen readers.','botanicals' ); ?>
		<?php _e('The icon will be added automatically, all you need to do is add a link to your menu.','botanicals' ); ?><br><br>
			
		<b><?php _e('Advanced','botanicals' ); ?></b><br>
		<?php _e('By default, the primary meny also shows the site title. You can hide this feature under the Advanced settings tab in the Customizer.','botanicals' ); ?>
	</div>

	<div class="doc-box" id="botanicals-widgets">
		<h3><?php _e('Widget areas','botanicals' ); ?></h3>
		<?php _e('The theme has two sidebars, one for the front page and one for posts, that can hold <b>any number of widgets</b>. The footer widget area is shown on all pages.','botanicals' ); ?><br>
		<?php _e('There is also an additional widget area in the footer below the social menu, where you can place a text widget and add your copyright text.','botanicals' );?> 
	</div>

	<div class="doc-box" id="botanicals-front">
			<h3><?php _e('Frontpage','botanicals' ); ?></h3>
			<?php _e('The standard front page has the following features:','botanicals' ); ?><br>
			<?php _e('<b>Site title and tagline:</b> You will find an option to hide or change the color of your header text in the customizer.','botanicals' ); ?><br>
			<?php _e('<b>Call to action:</b> The Call to Action is a great way to get your visitors attention. In the customizer you can:','botanicals' ); ?>
			<ul>
				<li><?php _e('Add your own text','botanicals' ); ?></li>
				<li><?php _e('Add a link','botanicals' )?></li>		
				<li><?php _e('Change colors','botanicals' )?></li>
				<li><?php _e('Hide the button','botanicals' ); ?></li>		
			</ul>
			<?php _e('<b>Header Background:</b> You can change the background image or background color in the customizer.','botanicals' )?> <br>
			<?php _e('<b>Search form:</b> You can hide the search form under the Advanced setting in the customizer.','botanicals' )?> <br>
			<h3><?php _e('Custom Frontpage','botanicals' )?></h3>
			<?php _e('<b>Page sections:</b> Page sections are a great way to display your shortcodes, testimonials, pricing tables, contact information and similar.', 'botanicals' ); ?><br>
			<?php _e('The two page sections can display up to 3 pages each. Pages in the top section are displayed above the blog content, and pages in the bottom section are displayed below.','botanicals' )?><br>
			<?php _e('You can also show your page sections together with a static front page, using the <i>Static and Sections</i> page template.','botanicals' )?><br>

	</div>

	<div class="doc-box" id="botanicals-advanced">
		<h3><?php _e('Advanced settings','botanicals' ); ?></h3>
		<?php _e('Under the Advanced settings tab in the customizer you will find the following options:','botanicals' )?>
		<ul>
			<li><?php _e('Hide the meta information. -This will hide the categories.','botanicals' )?></li>
			<li><?php _e('Hide the author, post date and tag information.','botanicals' )?></li>
			<li><?php _e('Hide the search form in the header.','botanicals' )?></li>
			<li><?php _e('Hide the Site title in the header menu.','botanicals' )?></li>
		</ul>
	</div>

	<div class="doc-box" id="botanicals-plugins">
		<h3><?php _e('Plugins','botanicals' ); ?></h3>
		<?php _e('Botanicals has been tested with and style has been added for the following plugins:', 'botanicals' ); ?>
		<ul>
			<li><b><?php _e('Woocommerce','botanicals' )?></b></li>
			<li><b><?php _e('bbPress','botanicals' )?></b></li>
			<li><b><?php _e('Jetpack','botanicals' )?></b><br><?php _e(' Note: Not all of Jetpacks modules are accessibe, and some uses iframes. I have increased the contrast of some of the modules.','botanicals' )?></li>
				<?php _e('Recommended modules:','botanicals' )?><br>
				<ul>
					<li><b><?php _e('Featured content','botanicals' )?></b><br>
						<?php _e('-Once Jetpack has been activated, you can select up to six posts or pages as a front page feature. Chose a tag and add it to your posts to seperate them from the rest.<br>
						You can also choose a label for the posts in your featured section. Featured images are optional and the recommended image size is 360x300 pixels.','botanicals' )?><br>
					</li>
					<li><b><?php _e('Custom Content Type: Portfolio','botanicals' )?></b><br>
						<?php _e('Botanicals also supports Jetpack','botanicals' )?> 
						<b><?php _e('Portfolios','botanicals' )?></b>. <a href="<?php echo 'http://en.support.wordpress.com/portfolios/'; ?>"><i><?php _e('Read more about how to setup your Portfolio on Jetpacks support site.','botanicals' )?></i></a><br><br>
					</li>

					<li><b><?php _e('Custom Content Type: Testimonials','botanicals' )?></b><br>
						<?php _e('Botanicals also supports Jetpack','botanicals' )?> <b><?php _e('Testimonials','botanicals' )?></b>. <br>
						<?php _e('<b>Tip:</b> I recommend creating a page and adding this shortcode, and then including the page as a front page section.','botanicals' )?> <br> &nbsp; [testimonials columns=3 showposts=3]<br>
						<a href="<?php echo 'https://en.support.wordpress.com/testimonials-shortcode/'; ?>"><i><?php _e('Read more about how to setup your Testimonials on Jetpacks support site.','botanicals' )?></i></a><br><br>		
					</li>

					<li><b><?php _e('Sharing','botanicals' )?></b><br>
						<?php _e('-If you activate Jetpack sharing, your buttons will be displayed below the meta information.','botanicals' )?><br>
					</li>
					<li><b><?php _e('Contact Form','botanicals' )?></b></li>
					<li><?php _e('<b>Site icon</b> -Use this module to add a favicon to your site.','botanicals' )?></li>
					<li><?php _e('<b>Site logo</b> -Once Jetpack has been activated, you can add a logo above your Site title on the front page. You will find this setting in the customizer.','botanicals' )?></li>
				</ul>
		</ul>
		</ul>
	</div>
<?php
}

?>