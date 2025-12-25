<?php
/**
 * botanicals Theme Customizer
 *
 * @package botanicals
 */

function botanicals_customize_register( $wp_customize ) {
	/*Add sections and panels to the WordPress customizer*/

	$wp_customize->add_panel( 'botanicals_action_panel', array(
		'priority'       => 70,
		'capability'     => 'edit_theme_options',
		'theme_supports' => '',
		'title' => __( 'Call to Action', 'botanicals' ),
		'description'    => __( 'The Call to Action is displayed below the site title in the header.', 'botanicals' ),
	) );
	
	$wp_customize->add_panel( 'botanicals_sections_panel', array(
		'priority'       => 70,
		'capability'     => 'edit_theme_options',
		'theme_supports' => '',
		'title' => __( 'Front page sections', 'botanicals' ),
		'description'    => __( 'Display pages as different sections of the front page.', 'botanicals' ),
	) );

	$wp_customize->add_section('botanicals_section_advanced',      array(
            'title' => __( 'Advanced settings', 'botanicals' ),
            'priority' => 100
        )
    );
		
	$wp_customize->add_section('botanicals_section_reset',      array(
            'title' => __( 'Reset', 'botanicals' ),
            'priority' => 220
        )
    );

	$wp_customize->get_section('header_image')->title = __( 'Header background', 'botanicals');

	$wp_customize->add_setting( 'botanicals_header_bgcolor', array(
		'default'        => '#9cc9c7',
		'sanitize_callback' => 'sanitize_hex_color',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'botanicals_header_bgcolor', array(
	'label'        => __( 'Header background color:', 'botanicals' ),
	'section' => 'header_image',
	'settings'  => 'botanicals_header_bgcolor',
	'priority' => 1,
	) ) );


	$wp_customize->add_setting( 'botanicals_header_bgpos',		 array(
		'sanitize_callback' => 'botanicals_sanitize_bgpos',
		'default' => 'center bottom',
	) );

	$wp_customize->add_control( 'botanicals_header_bgpos',		array(
	'type' => 'select',

	'label'        => __( 'Header background image position:', 'botanicals' ),
	'choices' => array(
			'left top'		=>  __('left top','botanicals'),
			'left center'	=>	__('left center','botanicals'),
			'left bottom'	=>	__('left bottom','botanicals'),
			'right top'		=>	__('right top','botanicals'),
			'right center'	=>	__('right center','botanicals'),
			'right bottom'	=>	__('right bottom','botanicals'),
			'center top'	=>	__('center top','botanicals'),
			'center center'	=>	__('center center','botanicals'),
			'center bottom'	=>	__('center bottom','botanicals'),
        ),
	'section' => 'header_image',
	) );

	$wp_customize->add_setting( 'botanicals_header_bgsize',		 array(
		'sanitize_callback' => 'botanicals_sanitize_bgsize',
	) );

	$wp_customize->add_control( 'botanicals_header_bgsize',		array(
	'type' => 'select',
	'label'        => __( 'Header background image size:', 'botanicals' ),
	'choices' => array(
			'cover'		=>  __('cover','botanicals'),
			'contain'	=>	__('contain','botanicals'),
			'auto'		=>	__('auto','botanicals'),
        ),
	'section' => 'header_image',
	) );

	$wp_customize->add_setting( 'botanicals_header_bgrepeat',		 array(
		'sanitize_callback' => 'botanicals_sanitize_bgrepeat',
		'default' => 'no-repeat',
	) );

	$wp_customize->add_control( 'botanicals_header_bgrepeat',		array(
	'type' => 'select',
	'label'        => __( 'Header background image repeat:', 'botanicals' ),
	'choices' => array(
			'repeat'		=>  __('repeat','botanicals'),
			'repeat-x'	=>	__('repeated only horizontally','botanicals'),
			'repeat-y'		=>	__('repeated only vertically','botanicals'),
			'no-repeat'		=>  __(' no repeat','botanicals'),
        ),
	'section' => 'header_image',
	) );

	//Hide meta
	$wp_customize->add_setting( 'botanicals_hide_meta',		array(
			'sanitize_callback' => 'botanicals_sanitize_checkbox',
		)
	);
	$wp_customize->add_control('botanicals_hide_meta',		array(
			'type' => 'checkbox',
			'label' =>  __( 'Check this box to hide the meta information.', 'botanicals' ),
			'section' => 'botanicals_section_advanced',
		)
	);

	//Hide author
	$wp_customize->add_setting( 'botanicals_hide_author',		array(
			'sanitize_callback' => 'botanicals_sanitize_checkbox',
		)
	);
	$wp_customize->add_control('botanicals_hide_author',		array(
			'type' => 'checkbox',
			'label' =>  __( 'Check this box to hide the author, post date and tag information.', 'botanicals' ),
			'section' => 'botanicals_section_advanced',
		)
	);

	/* Call to action text **/

	$wp_customize->add_section('botanicals_section_one',      array(
            'title' => __( 'Call to Action', 'botanicals' ),
            'priority' => 100,
            'panel'  => 'botanicals_action_panel',
        )
    );

	$wp_customize->add_setting( 'botanicals_action_text',		array(
			'sanitize_callback' => 'botanicals_sanitize_text',
		)
	);

	$wp_customize->add_control('botanicals_action_text',		array(
			'type' => 'text',
			'label' =>  __( 'Add this text to the Call to Action button on the front page:', 'botanicals' ),
			'section' => 'botanicals_section_one',
		)
	);	

	/* Call to action link **/
	$wp_customize->add_setting( 'botanicals_action_link',		array(
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control('botanicals_action_link',		array(
			'type' => 'text',
			'label' =>  __( 'Add a link to the Call to action button:', 'botanicals' ),
			'section' => 'botanicals_section_one',
		)
	);
	
	$wp_customize->add_setting( 'botanicals_hide_action',		array(
			'sanitize_callback' => 'botanicals_sanitize_checkbox',
		)
	);
	$wp_customize->add_control('botanicals_hide_action',		array(
			'type' => 'checkbox',
			'label' =>  __( 'Check this box to hide the Call to Action button.', 'botanicals' ),
			'section' => 'botanicals_section_one',
			'priority' => 1,
		)
	);

	$wp_customize->add_setting( 'botanicals_action_color', array(
		'default'        => '#000000',
		'sanitize_callback' => 'sanitize_hex_color',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'botanicals_action_color', array(
		'label'        => __( 'Call to Action text color:', 'botanicals' ),
		'section' => 'botanicals_section_one',
		'settings'  => 'botanicals_action_color',
	) ) );

	$wp_customize->add_setting( 'botanicals_action_bgcolor', array(
	    'default' => '',
	    'sanitize_callback' => 'sanitize_hex_color_no_hash',

	) );
	 
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'botanicals_action_bgcolor', array(
	    'label'   => __('Call to Action background color:','botanicals'),
	    'section' => 'botanicals_section_one',
	    'settings'   => 'botanicals_action_bgcolor',
	) ) );


	/*Advanced settings*/
	$wp_customize->add_setting( 'botanicals_hide_search',		array(
			'sanitize_callback' => 'botanicals_sanitize_checkbox',
		)
	);

	$wp_customize->add_control('botanicals_hide_search',		array(
			'type' => 'checkbox',
			'label' =>  __( 'Check this box to hide the search form in the header.', 'botanicals' ),
			'section' => 'botanicals_section_advanced',
		)
	);

	$wp_customize->add_setting( 'botanicals_hide_title',		array(
			'sanitize_callback' => 'botanicals_sanitize_checkbox',
		)
	);
	$wp_customize->add_control('botanicals_hide_title',		array(
			'type' => 'checkbox',
			'label' =>  __( 'Check this box to hide the clickable site title in the header menu.', 'botanicals' ),
			'section' => 'botanicals_section_advanced',
		)
	);

	/*Frontpage sections*/

	/* Top Section */
	$wp_customize->add_section( 'botanicals_top_section', array(
			'title' => __( 'Top Section', 'botanicals' ),
			'panel'  => 'botanicals_sections_panel',
			'description' => __('Choose upto 3 pages that will be displayed above your blog content.', 'botanicals'),
	) );

	for ($i = 1; $i < 4; $i++) {
			$wp_customize->add_setting( 'botanicals_top_section' . $i,	 array(
				'sanitize_callback' => 'botanicals_sanitize_page',

			) );

			$wp_customize->add_control( 'botanicals_top_section' . $i,		array(
				'default' => 0,
			    'type' => 'dropdown-pages',
		        'label' => __( 'Choose a page:','botanicals'),
				'section' => 'botanicals_top_section',
			) );
	}

	/* Bottom Section */
	$wp_customize->add_section( 'botanicals_bottom_section', array(
			'title' => __( 'Bottom Section', 'botanicals' ),
			'panel'  => 'botanicals_sections_panel',
			'description' => __('Choose upto 3 pages that will be displayed below your blog content, but above the footer.', 'botanicals'),
	) );

	for ($i = 1; $i < 4; $i++) {
			$wp_customize->add_setting( 'botanicals_bottom_section' . $i,		 array(
				'sanitize_callback' => 'botanicals_sanitize_page',

			) );

			$wp_customize->add_control( 'botanicals_bottom_section' . $i,		array(
				'default' => 0,
			    'type' => 'dropdown-pages',
		        'label' => __( 'Choose a page:','botanicals'),
				'section' => 'botanicals_bottom_section',
			) );
	}

	/* if jetpack is installed, add the featured heading to the customizer. */
	$wp_customize->add_setting( 'botanicals_featured_headline',		array(
				'sanitize_callback' => 'botanicals_sanitize_text',
				'default'        => __( 'Featured', 'botanicals' ),
			)
		);
		$wp_customize->add_control('botanicals_featured_headline',		array(
				'type' => 'text',
				'label' =>  __( 'Label your featured content:', 'botanicals' ),
				'section' => 'featured_content',
			)
		);

/*********************************************************************************************************************************
 Reset 
 */
	$wp_customize->add_setting( 'botanicals_reset',		array(
			'sanitize_callback' => 'botanicals_sanitize_reset',
		)
	);
	$wp_customize->add_control('botanicals_reset',		array(
			'type' => 'text',
			'label' =>  __( 'Are you sure that you want to reset your settings? Type YES in the box, save and refresh the page.', 'botanicals' ),
			'section' => 'botanicals_section_reset',
		)
	);

	$wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
	$wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';
	$wp_customize->get_setting( 'botanicals_hide_title' )->transport  = 'postMessage';

	if ( botanicals_has_featured_posts( 1 ) ) {
		$wp_customize->get_setting( 'botanicals_featured_headline' )->transport  = 'postMessage';
	}
}
add_action( 'customize_register', 'botanicals_customize_register' );


/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function botanicals_customize_preview_js() {
	wp_enqueue_script( 'botanicals_customizer', get_template_directory_uri() . '/js/customizer.js', array( 'customize-preview' ), '20130508', true );
}
add_action( 'customize_preview_init', 'botanicals_customize_preview_js' );


function botanicals_sanitize_text( $input ) {
	return wp_kses_post( force_balance_tags( $input ) );  
}

function botanicals_sanitize_checkbox( $input ) {
    if ( $input == 1 ) {
        return 1;
    } else {
        return '';
    }
}

//Reset the theme settings
function botanicals_sanitize_reset( $input ) {
	$input=sanitize_text_field( $input );

	if($input == 'YES'){
		remove_theme_mods();
	}else{
		return;
	}
}

//Sanitize bg position
function botanicals_sanitize_bgpos( $input ) {
    $valid = array(
       	'left top'		=>  __('left top','botanicals'),
		'left center'	=>	__('left center','botanicals'),
		'left bottom'	=>	__('left bottom','botanicals'),
		'right top'		=>	__('right top','botanicals'),
		'right center'	=>	__('right center','botanicals'),
		'right bottom'	=>	__('right bottom','botanicals'),
		'center top'	=>	__('center top','botanicals'),
		'center center'	=>	__('center center','botanicals'),
		'center bottom'	=>	__('center bottom','botanicals'),
    );
 
    if ( array_key_exists( $input, $valid ) ) {
        return $input;
    } else {
        return '';
    }
}

//Sanitize bg size
function botanicals_sanitize_bgsize( $input ) {
    $valid = array(
		'cover'		=>  __('cover','botanicals'),
		'contain'	=>	__('contain','botanicals'),
		'auto'		=>	__('auto','botanicals'),
    );
 
    if ( array_key_exists( $input, $valid ) ) {
        return $input;
    } else {
        return '';
    }
}

//Sanitize bg repeat
function botanicals_sanitize_bgrepeat( $input ) {
    $valid = array(
		'repeat'		=>  __('repeat','botanicals'),
		'repeat-x'		=>	__('repeated only horizontally','botanicals'),
		'repeat-y'		=>	__('repeated only vertically','botanicals'),
		'no-repeat'		=>  __(' no repeat','botanicals'),
    );
 
    if ( array_key_exists( $input, $valid ) ) {
        return $input;
    } else {
        return '';
    }
}

// Sanitize the page select lists
function botanicals_sanitize_page( $input ) {
    if( is_numeric( $input ) ) {
        return intval( $input );
    }
}

?>