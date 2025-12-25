module.exports = function() {
	
	var settings;
	
	return {
		
		settings: {
			
		},
		
		init: function() {
			
			this.removeViewCartButtons();
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