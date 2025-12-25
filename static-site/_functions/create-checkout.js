/**
 * Cloudflare Worker: Create Stripe Checkout Session
 * 
 * This worker creates a Stripe Checkout session from cart data
 * and returns the session URL for redirect.
 */

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Only allow POST requests
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        try {
            // Get Stripe secret key from environment
            const stripeSecretKey = env.STRIPE_SECRET_KEY;
            if (!stripeSecretKey) {
                throw new Error('STRIPE_SECRET_KEY not configured');
            }

            // Parse request body
            const body = await request.json();
            const { line_items, customer_email, success_url, cancel_url, metadata } = body;

            if (!line_items || line_items.length === 0) {
                return new Response(JSON.stringify({ error: 'No line items provided' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Build form data for Stripe API
            const formData = new URLSearchParams();
            formData.append('mode', 'payment');
            formData.append('success_url', success_url || `${new URL(request.url).origin}/success.html`);
            formData.append('cancel_url', cancel_url || `${new URL(request.url).origin}/cart.html`);
            
            if (customer_email) {
                formData.append('customer_email', customer_email);
            }
            
            // Add line items
            line_items.forEach((item, index) => {
                if (item.price_data) {
                    formData.append(`line_items[${index}][price_data][currency]`, item.price_data.currency || 'usd');
                    formData.append(`line_items[${index}][price_data][unit_amount]`, Math.round(item.price_data.unit_amount));
                    
                    if (item.price_data.product_data) {
                        formData.append(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name);
                        if (item.price_data.product_data.images) {
                            item.price_data.product_data.images.forEach((img, imgIndex) => {
                                formData.append(`line_items[${index}][price_data][product_data][images][${imgIndex}]`, img);
                            });
                        }
                    }
                }
                formData.append(`line_items[${index}][quantity]`, item.quantity);
            });
            
            // Add metadata
            if (metadata) {
                Object.keys(metadata).forEach(key => {
                    const value = typeof metadata[key] === 'object' 
                        ? JSON.stringify(metadata[key]) 
                        : metadata[key];
                    formData.append(`metadata[${key}]`, value);
                });
            }
            
            // Create Stripe Checkout session
            const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stripeSecretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (!stripeResponse.ok) {
                const error = await stripeResponse.text();
                console.error('Stripe API error:', error);
                return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            const session = await stripeResponse.json();

            return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            console.error('Error creating checkout session:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    },
};

