(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function () {
  var settings;
  return {
    settings: {},
    init: function init() {
      this.animateInMobileMenu();
    },
    animateInMobileMenu: function animateInMobileMenu() {
      var mainNavigation = document.querySelector('.main-navigation');
      var menu = mainNavigation.querySelector('.menu-toggle');
      menu.addEventListener('click', function () {
        var menuItems = document.querySelectorAll('.main-navigation .nav-menu li');
        var htmlDoc = document.querySelector('html');

        var _loop = function _loop(i) {
          if (mainNavigation.classList.contains('toggled')) {
            setTimeout(function () {
              menuItems[i].style.opacity = "1";
            }, i * 70 + 400);
          } else {
            menuItems[i].style.opacity = "0";
          }
        };

        for (var i = 0; i < menuItems.length; i++) {
          _loop(i);
        }

        if (mainNavigation.classList.contains('toggled')) {
          htmlDoc.style.overflowY = "hidden";
          menu.classList.add('is-active');
        } else {
          htmlDoc.style.overflowY = "";
          menu.classList.remove('is-active');
        }
      });
    }
  };
};

},{}],2:[function(require,module,exports){
"use strict";

module.exports = function () {
  var settings;
  return {
    settings: {},
    init: function init() {
      this.removeViewCartButtons();
    },
    // Remove view cart buttons in woocommerce alerts so user has to use custom checkout button
    removeViewCartButtons: function removeViewCartButtons() {
      var viewCartButtons = document.querySelectorAll('.wc-forward');

      for (var i = 0; i < viewCartButtons.length; i++) {
        if (viewCartButtons[i].textContent.toLowerCase() === "View Cart".toLowerCase()) {
          viewCartButtons[i].style.display = 'none';
          viewCartButtons[i].remove();
        }
      }
    }
  };
};

},{}],3:[function(require,module,exports){
"use strict";

var Header = require('./components/header.js');

var Shop = require('./components/shop.js');

var Utilities = require('./utils.js');

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    Shop().init();
    Header().init();
  });
})();

},{"./components/header.js":1,"./components/shop.js":2,"./utils.js":4}],4:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;

  window.utils = function () {
    return {
      appSettings: {
        breakpoints: {
          mobileMax: 767,
          tabletMin: 768,
          tabletMax: 991,
          desktopMin: 992,
          desktopLargeMin: 1200
        }
      },
      mobile: function mobile() {
        return window.innerWidth < this.appSettings.breakpoints.tabletMin;
      },
      tablet: function tablet() {
        return window.innerWidth > this.appSettings.breakpoints.mobileMax && window.innerWidth < this.appSettings.breakpoints.desktopMin;
      },
      desktop: function desktop() {
        return window.innerWidth > this.appSettings.breakpoints.desktopMin;
      },
      getBreakpoint: function getBreakpoint() {
        if (window.innerWidth < this.appSettings.breakpoints.tabletMin) return 'mobile';else if (window.innerWidth < this.appSettings.breakpoints.desktopMin) return 'tablet';else return 'desktop';
      },
      debounce: function debounce(func, wait, immediate) {
        var timeout;
        return function () {
          var context = this,
              args = arguments;

          var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };

          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      },

      /* Purpose: Detect if any of the element is currently within the viewport */
      anyOnScreen: function anyOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
      },

      /* Purpose: Detect if an element is vertically on screen; if the top and bottom of the element are both within the viewport. */
      allOnScreen: function allOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.bottom < bounds.top && viewport.top > bounds.bottom);
      },
      secondsToMilliseconds: function secondsToMilliseconds(seconds) {
        return seconds * 1000;
      },

      /*
      * Purpose: This method allows you to temporarily disable an an element's transition so you can modify its proprties without having it animate those changing properties.
      * Params:
      * 	-element: The element you would like to modify.
      * 	-cssTransformation: The css transformation you would like to make, i.e. {'width': 0, 'height': 0} or 'border', '1px solid black'
      */
      getTransitionDuration: function getTransitionDuration(element) {
        var $element = $(element);
        return utils.secondsToMilliseconds(parseFloat(getComputedStyle($element[0])['transitionDuration']));
      },
      isInteger: function isInteger(number) {
        return number % 1 === 0;
      }
    };
  }();

  module.exports = window.utils;
})();

},{}]},{},[3]);
