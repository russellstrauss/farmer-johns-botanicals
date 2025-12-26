module.exports = function() {
	
	var settings;
	
	return {
		
		settings: {
			
		},
		
		init: function() {
			
			this.removeViewCartButtons();
			this.initProductGallery();
		},
		
		// Ensure WooCommerce product gallery is visible and functional
		initProductGallery: function() {
			var self = this;
			// Wait for jQuery and WooCommerce scripts to load
			if (typeof jQuery === 'undefined') {
				// If jQuery isn't loaded yet, wait a bit and try again
				setTimeout(function() {
					self.initProductGallery();
				}, 100);
				return;
			}
		
			jQuery(function($) {
				// Find all product galleries
				var $galleries = $('.woocommerce-product-gallery');
				
				if ($galleries.length === 0) {
					return;
				}
				
				// Ensure galleries are visible (fallback if WooCommerce script didn't initialize)
				$galleries.each(function() {
					var $gallery = $(this);
					
					// If gallery is still at opacity 0 after a delay, make it visible
					setTimeout(function() {
						if ($gallery.css('opacity') === '0' || $gallery.css('opacity') === 0) {
							// Check if WooCommerce gallery script has initialized
							if (typeof wc_single_product_params !== 'undefined' && $.fn.wc_product_gallery) {
								// Try to initialize the gallery if it hasn't been initialized
								if (!$gallery.data('wc-product-gallery')) {
									$gallery.wc_product_gallery(wc_single_product_params);
								}
							} else {
								// Fallback: just make it visible if scripts aren't available
								$gallery.css('opacity', '1');
							}
						}
					}, 500);
				});
				
				// Also ensure gallery is visible after images load
				$('.woocommerce-product-gallery__image img').on('load', function() {
					var $gallery = $(this).closest('.woocommerce-product-gallery');
					if ($gallery.length && ($gallery.css('opacity') === '0' || $gallery.css('opacity') == 0)) {
						$gallery.css('opacity', '1');
					}
				});
			});
		},
		
		// Remove view cart buttons in woocommerce alerts so user has to use custom checkout button
		removeViewCartButtons: function() {
			let viewCartButtons = document.querySelectorAll('.wc-forward');
			
			for (let i = 0; i < viewCartButtons.length; i++) {
				if (viewCartButtons[i].textContent.toLowerCase() === "View Cart".toLowerCase()) {
					viewCartButtons[i].style.display = 'none';
					viewCartButtons[i].remove();
				}
			}
		}
	}
}