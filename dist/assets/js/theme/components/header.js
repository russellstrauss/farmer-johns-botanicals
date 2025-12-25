module.exports = function() {
	
	var settings;
	
	return {
		
		settings: {
			
		},
		
		init: function() {
			
			this.animateInMobileMenu();
		},
		
		animateInMobileMenu: function() {
			
			let mainNavigation = document.querySelector('.main-navigation');
			let menu = mainNavigation.querySelector('.menu-toggle');
			
			menu.addEventListener('click', function() {
								
				let menuItems = document.querySelectorAll('.main-navigation .nav-menu li');
				let htmlDoc = document.querySelector('html');

				for (let i = 0; i < menuItems.length; i++) {
					
					if (mainNavigation.classList.contains('toggled')) {
						
						setTimeout(function() {
							menuItems[i].style.opacity = "1";
						}, (i * 70) + 400);
					}
					else {
						menuItems[i].style.opacity = "0";
					}
				}
				
				if (mainNavigation.classList.contains('toggled')) {
					htmlDoc.style.overflowY = "hidden";
					menu.classList.add('is-active');
				}
				else {
					htmlDoc.style.overflowY = "";
					menu.classList.remove('is-active');
				}
			});
		}
	}
}