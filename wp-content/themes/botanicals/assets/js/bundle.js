(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // wp-content/themes/botanicals/assets/js/components/header.js
  var header_exports = {};
  var init_header = __esm({
    "wp-content/themes/botanicals/assets/js/components/header.js"() {
      module.exports = function() {
        var settings;
        return {
          settings: {},
          init: function() {
            this.animateInMobileMenu();
          },
          animateInMobileMenu: function() {
            let mainNavigation = document.querySelector(".main-navigation");
            let menu = mainNavigation.querySelector(".menu-toggle");
            menu.addEventListener("click", function() {
              let menuItems = document.querySelectorAll(".main-navigation .nav-menu li");
              let htmlDoc = document.querySelector("html");
              for (let i = 0; i < menuItems.length; i++) {
                if (mainNavigation.classList.contains("toggled")) {
                  setTimeout(function() {
                    menuItems[i].style.opacity = "1";
                  }, i * 70 + 400);
                } else {
                  menuItems[i].style.opacity = "0";
                }
              }
              if (mainNavigation.classList.contains("toggled")) {
                htmlDoc.style.overflowY = "hidden";
                menu.classList.add("is-active");
              } else {
                htmlDoc.style.overflowY = "";
                menu.classList.remove("is-active");
              }
            });
          }
        };
      };
    }
  });

  // wp-content/themes/botanicals/assets/js/components/shop.js
  var shop_exports = {};
  var init_shop = __esm({
    "wp-content/themes/botanicals/assets/js/components/shop.js"() {
      module.exports = function() {
        var settings;
        return {
          settings: {},
          init: function() {
            this.removeViewCartButtons();
            this.initProductGallery();
          },
          // Ensure WooCommerce product gallery is visible and functional
          initProductGallery: function() {
            var self = this;
            if (typeof jQuery === "undefined") {
              setTimeout(function() {
                self.initProductGallery();
              }, 100);
              return;
            }
            jQuery(function($2) {
              var $galleries = $2(".woocommerce-product-gallery");
              if ($galleries.length === 0) {
                return;
              }
              $galleries.each(function() {
                var $gallery = $2(this);
                setTimeout(function() {
                  if ($gallery.css("opacity") === "0" || $gallery.css("opacity") === 0) {
                    if (typeof wc_single_product_params !== "undefined" && $2.fn.wc_product_gallery) {
                      if (!$gallery.data("wc-product-gallery")) {
                        $gallery.wc_product_gallery(wc_single_product_params);
                      }
                    } else {
                      $gallery.css("opacity", "1");
                    }
                  }
                }, 500);
              });
              $2(".woocommerce-product-gallery__image img").on("load", function() {
                var $gallery = $2(this).closest(".woocommerce-product-gallery");
                if ($gallery.length && ($gallery.css("opacity") === "0" || $gallery.css("opacity") == 0)) {
                  $gallery.css("opacity", "1");
                }
              });
            });
          },
          // Remove view cart buttons in woocommerce alerts so user has to use custom checkout button
          removeViewCartButtons: function() {
            let viewCartButtons = document.querySelectorAll(".wc-forward");
            for (let i = 0; i < viewCartButtons.length; i++) {
              if (viewCartButtons[i].textContent.toLowerCase() === "View Cart".toLowerCase()) {
                viewCartButtons[i].style.display = "none";
                viewCartButtons[i].remove();
              }
            }
          }
        };
      };
    }
  });

  // wp-content/themes/botanicals/assets/js/utils.js
  var utils_exports = {};
  var init_utils = __esm({
    "wp-content/themes/botanicals/assets/js/utils.js"() {
      (function() {
        var appSettings;
        window.utils = /* @__PURE__ */ (function() {
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
            mobile: function() {
              return window.innerWidth < this.appSettings.breakpoints.tabletMin;
            },
            tablet: function() {
              return window.innerWidth > this.appSettings.breakpoints.mobileMax && window.innerWidth < this.appSettings.breakpoints.desktopMin;
            },
            desktop: function() {
              return window.innerWidth > this.appSettings.breakpoints.desktopMin;
            },
            getBreakpoint: function() {
              if (window.innerWidth < this.appSettings.breakpoints.tabletMin) return "mobile";
              else if (window.innerWidth < this.appSettings.breakpoints.desktopMin) return "tablet";
              else return "desktop";
            },
            debounce: function(func, wait, immediate) {
              var timeout;
              return function() {
                var context = this, args = arguments;
                var later = function() {
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
            anyOnScreen: function(element) {
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
            allOnScreen: function(element) {
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
            secondsToMilliseconds: function(seconds) {
              return seconds * 1e3;
            },
            /*
            * Purpose: This method allows you to temporarily disable an an element's transition so you can modify its proprties without having it animate those changing properties.
            * Params:
            * 	-element: The element you would like to modify.
            * 	-cssTransformation: The css transformation you would like to make, i.e. {'width': 0, 'height': 0} or 'border', '1px solid black'
            */
            getTransitionDuration: function(element) {
              var $element = $(element);
              return utils.secondsToMilliseconds(parseFloat(getComputedStyle($element[0])["transitionDuration"]));
            },
            isInteger: function(number) {
              return number % 1 === 0;
            }
          };
        })();
        module.exports = window.utils;
      })();
    }
  });

  // wp-content/themes/botanicals/assets/js/main.js
  var Header = (init_header(), __toCommonJS(header_exports));
  var Shop = (init_shop(), __toCommonJS(shop_exports));
  var Utilities = (init_utils(), __toCommonJS(utils_exports));
  (function() {
    document.addEventListener("DOMContentLoaded", function() {
      Shop().init();
      Header().init();
    });
  })();
})();
//# sourceMappingURL=bundle.js.map
