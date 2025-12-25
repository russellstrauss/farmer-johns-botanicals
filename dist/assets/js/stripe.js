/**
 * Stripe Checkout Integration
 * Handles creating Stripe Checkout sessions via Cloudflare Worker
 */

class StripeCheckout {
    constructor() {
        this.checkoutEndpoint = '/api/create-checkout';
        this.init();
    }

    /**
     * Initialize Stripe integration
     */
    init() {
        // Check if Stripe publishable key is available
        const stripeKey = this.getStripeKey();
        if (!stripeKey) {
            console.warn('Stripe publishable key not found');
        }
    }

    /**
     * Get Stripe publishable key from meta tag or config
     * @returns {string|null} Stripe publishable key
     */
    getStripeKey() {
        const metaTag = document.querySelector('meta[name="stripe-publishable-key"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        // Fallback to window config
        return window.STRIPE_PUBLISHABLE_KEY || null;
    }

    /**
     * Create checkout session and redirect to Stripe
     * @param {Array} cartItems - Array of cart items
     * @param {string} customerEmail - Customer email (optional)
     * @returns {Promise} Promise that resolves when checkout is initiated
     */
    async createCheckoutSession(cartItems, customerEmail = null) {
        try {
            // Validate cart
            if (!cartItems || cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            // Prepare line items for Stripe
            const lineItems = cartItems.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : []
                    },
                    unit_amount: Math.round(item.price * 100) // Convert to cents
                },
                quantity: item.quantity
            }));

            // Get success and cancel URLs
            const successUrl = new URL('/success.html', window.location.origin).href;
            const cancelUrl = new URL('/cart.html', window.location.origin).href;

            // Create checkout session via Worker
            const response = await fetch(this.checkoutEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    line_items: lineItems,
                    customer_email: customerEmail,
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    metadata: {
                        cart_items: JSON.stringify(cartItems.map(item => ({
                            sku: item.sku,
                            name: item.name,
                            quantity: item.quantity
                        })))
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Error starting checkout: ' + error.message);
            throw error;
        }
    }

    /**
     * Handle checkout button click
     * @param {Array} cartItems - Cart items to checkout
     * @param {string} customerEmail - Optional customer email
     */
    async handleCheckout(cartItems, customerEmail = null) {
        // Show loading state
        const checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processing...';
        }

        try {
            await this.createCheckoutSession(cartItems, customerEmail);
        } catch (error) {
            // Re-enable button on error
            if (checkoutButton) {
                checkoutButton.disabled = false;
                checkoutButton.textContent = 'Proceed to Checkout';
            }
        }
    }
}

// Initialize global Stripe instance
const stripeCheckout = new StripeCheckout();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StripeCheckout;
}

