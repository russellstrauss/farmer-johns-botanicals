// Cloudflare Worker for creating Stripe checkout sessions
// Add STRIPE_SECRET_KEY in Cloudflare Workers environment variables

export default {
  async fetch(request, env) {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ message: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const body = await request.json()
      const { line_items, customer_email, success_url, cancel_url, metadata } = body

      // Import Stripe (you'll need to use a CDN or bundle it)
      // For Cloudflare Workers, you may need to use a different approach
      // This is a simplified example - you may need to use stripe-node or a bundled version
      
      const stripe = require('stripe')(env.STRIPE_SECRET_KEY)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: success_url || new URL('/success', request.url).href,
        cancel_url: cancel_url || new URL('/cart', request.url).href,
        customer_email: customer_email || undefined,
        metadata: metadata || {}
      })

      return new Response(JSON.stringify({
        url: session.url,
        sessionId: session.id
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Stripe error:', error)
      return new Response(JSON.stringify({
        message: error.message || 'Failed to create checkout session'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

