/**
 * Cloudflare Worker: Stripe Webhook Handler
 * 
 * This worker handles Stripe webhook events, saves orders to D1 database,
 * and sends confirmation emails.
 */

export default {
    async fetch(request, env) {
        // Only allow POST requests
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            // Get webhook secret from environment
            const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
            if (!webhookSecret) {
                throw new Error('STRIPE_WEBHOOK_SECRET not configured');
            }

            // Get request body
            const body = await request.text();
            const signature = request.headers.get('stripe-signature');

            if (!signature) {
                return new Response(JSON.stringify({ error: 'No signature provided' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Verify webhook signature
            // Note: In production, use Stripe's signature verification library
            // For now, we'll parse the event directly
            const event = JSON.parse(body);

            // Handle different event types
            switch (event.type) {
                case 'checkout.session.completed':
                    await handleCheckoutSessionCompleted(event.data.object, env);
                    break;
                case 'payment_intent.succeeded':
                    await handlePaymentIntentSucceeded(event.data.object, env);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Webhook error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    },
};

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session, env) {
    try {
        // Get D1 database
        const db = env.DB;

        // Extract order data from session
        const customerEmail = session.customer_details?.email || session.customer_email;
        const customerName = session.customer_details?.name || '';
        const totalAmount = session.amount_total; // in cents
        const currency = session.currency || 'usd';
        const shippingAddress = session.shipping_details?.address 
            ? JSON.stringify(session.shipping_details.address) 
            : null;

        // Parse metadata for cart items
        let cartItems = [];
        if (session.metadata && session.metadata.cart_items) {
            try {
                cartItems = JSON.parse(session.metadata.cart_items);
            } catch (e) {
                console.error('Error parsing cart items:', e);
            }
        }

        // Insert order into database
        const orderResult = await db.prepare(`
            INSERT INTO orders (
                stripe_session_id,
                stripe_payment_intent_id,
                customer_email,
                customer_name,
                total_amount,
                currency,
                status,
                shipping_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            session.id,
            session.payment_intent || null,
            customerEmail,
            customerName,
            totalAmount,
            currency,
            'completed',
            shippingAddress
        ).run();

        const orderId = orderResult.meta.last_row_id;

        // Insert order items
        if (cartItems.length > 0) {
            for (const item of cartItems) {
                await db.prepare(`
                    INSERT INTO order_items (
                        order_id,
                        product_sku,
                        product_name,
                        quantity,
                        price
                    ) VALUES (?, ?, ?, ?, ?)
                `).bind(
                    orderId,
                    item.sku || 'UNKNOWN',
                    item.name || 'Unknown Product',
                    item.quantity || 1,
                    // Price will be calculated from line items if available
                    // For now, we'll use 0 and update from Stripe if needed
                    0
                ).run();
            }
        }

        // Send confirmation email
        await sendOrderConfirmationEmail(customerEmail, orderId, cartItems, totalAmount, env);

        console.log(`Order ${orderId} saved successfully`);
    } catch (error) {
        console.error('Error handling checkout session:', error);
        throw error;
    }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent, env) {
    // Update order status if needed
    // This is a backup in case checkout.session.completed wasn't processed
    try {
        const db = env.DB;
        await db.prepare(`
            UPDATE orders 
            SET stripe_payment_intent_id = ?, status = 'completed'
            WHERE stripe_payment_intent_id = ? OR stripe_session_id IN (
                SELECT id FROM checkout_sessions WHERE payment_intent = ?
            )
        `).bind(paymentIntent.id, paymentIntent.id, paymentIntent.id).run();
    } catch (error) {
        console.error('Error updating payment intent:', error);
    }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(email, orderId, items, total, env) {
    try {
        // Use Cloudflare Email Workers or third-party service
        // For now, we'll use a simple email service
        
        // Example using Mailgun (free tier: 100 emails/day)
        const mailgunApiKey = env.MAILGUN_API_KEY;
        const mailgunDomain = env.MAILGUN_DOMAIN;
        
        if (mailgunApiKey && mailgunDomain) {
            const emailBody = generateOrderEmail(orderId, items, total);
            
            const formData = new FormData();
            formData.append('from', `Farmer John's Botanicals <noreply@${mailgunDomain}>`);
            formData.append('to', email);
            formData.append('subject', `Order Confirmation #${orderId}`);
            formData.append('html', emailBody);

            await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
                },
                body: formData,
            });
        } else {
            // Log email if service not configured
            console.log('Email would be sent:', {
                to: email,
                subject: `Order Confirmation #${orderId}`,
                body: generateOrderEmail(orderId, items, total),
            });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw - email failure shouldn't break order processing
    }
}

/**
 * Generate order confirmation email HTML
 */
function generateOrderEmail(orderId, items, total) {
    const itemsHtml = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${(total / 100 / items.reduce((sum, i) => sum + i.quantity, 0)).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <html>
            <body>
                <h1>Thank You for Your Order!</h1>
                <p>Your order #${orderId} has been received and is being processed.</p>
                <h2>Order Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2"><strong>Total</strong></td>
                            <td><strong>$${(total / 100).toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                <p>We'll send you another email when your order ships.</p>
            </body>
        </html>
    `;
}

