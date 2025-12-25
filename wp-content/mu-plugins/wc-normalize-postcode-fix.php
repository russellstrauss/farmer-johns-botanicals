<?php
/**
 * Plugin Name: WooCommerce Normalize Postcode Fix
 * Description: Adds missing wc_normalize_postcode() function for WooCommerce compatibility
 * Version: 1.0.0
 * Author: Auto-generated fix
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Normalize postcode by removing spaces and converting to uppercase.
 * 
 * This function normalizes a postcode for comparison purposes by:
 * - Trimming whitespace
 * - Converting to uppercase
 * - Removing all spaces
 * 
 * @param string $postcode The postcode to normalize.
 * @return string The normalized postcode.
 */
if ( ! function_exists( 'wc_normalize_postcode' ) ) {
	function wc_normalize_postcode( $postcode ) {
		if ( empty( $postcode ) ) {
			return '';
		}
		
		// Convert to string if not already
		$postcode = (string) $postcode;
		
		// Trim and convert to uppercase
		$postcode = strtoupper( trim( $postcode ) );
		
		// Remove all spaces
		$postcode = preg_replace( '/[\s]/', '', $postcode );
		
		return $postcode;
	}
}

