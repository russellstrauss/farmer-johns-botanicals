/**
 * Shopping Cart Management
 * Handles cart operations using localStorage
 */

class ShoppingCart {
    constructor() {
        this.storageKey = 'fjb_cart';
        this.cart = this.loadCart();
        this.init();
    }

    /**
     * Initialize cart - update UI, bind events
     */
    init() {
        this.updateCartIcon();
        this.bindEvents();
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            return cartData ? JSON.parse(cartData) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            this.updateCartIcon();
            this.dispatchCartUpdate();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    /**
     * Add item to cart
     * @param {Object} product - Product object with id, name, price, sku, image
     * @param {number} quantity - Quantity to add (default: 1)
     * @param {Object} variation - Variation data if applicable
     */
    addItem(product, quantity = 1, variation = null) {
        const item = {
            id: product.id,
            sku: product.sku || `PROD-${product.id}`,
            name: product.name,
            price: parseFloat(product.price),
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            quantity: parseInt(quantity),
            variation: variation || null
        };

        // Check if item already exists in cart
        const existingIndex = this.cart.findIndex(cartItem => {
            if (variation) {
                return cartItem.id === product.id && 
                       JSON.stringify(cartItem.variation) === JSON.stringify(variation);
            }
            return cartItem.id === product.id && !cartItem.variation;
        });

        if (existingIndex > -1) {
            // Update quantity of existing item
            this.cart[existingIndex].quantity += item.quantity;
        } else {
            // Add new item
            this.cart.push(item);
        }

        this.saveCart();
        return this.cart;
    }

    /**
     * Remove item from cart
     * @param {number} index - Index of item in cart array
     */
    removeItem(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.saveCart();
        }
        return this.cart;
    }

    /**
     * Update item quantity
     * @param {number} index - Index of item in cart array
     * @param {number} quantity - New quantity
     */
    updateQuantity(index, quantity) {
        if (index >= 0 && index < this.cart.length) {
            const qty = parseInt(quantity);
            if (qty > 0) {
                this.cart[index].quantity = qty;
            } else {
                this.removeItem(index);
            }
            this.saveCart();
        }
        return this.cart;
    }

    /**
     * Get cart total
     * @returns {number} Total price
     */
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Get cart item count
     * @returns {number} Total number of items
     */
    getItemCount() {
        return this.cart.reduce((count, item) => {
            return count + item.quantity;
        }, 0);
    }

    /**
     * Clear cart
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    /**
     * Get all cart items
     * @returns {Array} Cart items
     */
    getItems() {
        return this.cart;
    }

    /**
     * Check if cart is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.cart.length === 0;
    }

    /**
     * Update cart icon with item count
     */
    updateCartIcon() {
        const count = this.getItemCount();
        const cartIcon = document.querySelector('.cart-count');
        const cartLink = document.querySelector('.cart-link');
        
        if (cartIcon) {
            cartIcon.textContent = count > 0 ? `(${count})` : '';
        }
        
        if (cartLink) {
            const countText = count > 0 ? ` (${count})` : '';
            cartLink.textContent = `checkout${countText}`;
        }
    }

    /**
     * Bind cart events
     */
    bindEvents() {
        // Listen for cart updates from other pages
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.cart = this.loadCart();
                this.updateCartIcon();
                this.dispatchCartUpdate();
            }
        });

        // Dispatch custom event for cart updates
        this.dispatchCartUpdate();
    }

    /**
     * Dispatch cart update event
     */
    dispatchCartUpdate() {
        const event = new CustomEvent('cartUpdated', {
            detail: {
                cart: this.cart,
                total: this.getTotal(),
                itemCount: this.getItemCount()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Format price for display
     * @param {number} price - Price in dollars
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
}

// Initialize global cart instance
const cart = new ShoppingCart();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}

