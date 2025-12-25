var Header = require('./components/header.js');
var Shop = require('./components/shop.js');
var Utilities = require('./utils.js');

(function () {
	
	document.addEventListener("DOMContentLoaded",function(){
		
		Shop().init();
		Header().init();
	});
	
})();