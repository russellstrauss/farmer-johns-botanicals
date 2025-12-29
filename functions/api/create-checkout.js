// Cloudflare Pages Function for creating Stripe checkout sessions
// Add STRIPE_SECRET_KEY in Cloudflare Pages environment variables

import Stripe from 'stripe'

export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    // Initialize Stripe with Workers-compatible HTTP client
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-06-20'
    })

    const body = await request.json()
    const { 
      line_items, 
      customer_email, 
      customer_name,
      shipping_address,
      shipping_name,
      success_url, 
      cancel_url, 
      metadata 
    } = body

    // Get origin from request headers
    const origin = request.headers.get('origin') || request.headers.get('referer') || ''

    // Prepare session parameters
    const sessionParams = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: success_url || new URL('/success', origin || request.url).href,
      cancel_url: cancel_url || new URL('/checkout', origin || request.url).href,
      metadata: metadata || {}
    }

    // Add customer email if provided
    if (customer_email) {
      sessionParams.customer_email = customer_email
    }

    // Require shipping address collection for physical products
    sessionParams.shipping_address_collection = {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'NZ', 'JP']
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create(sessionParams)

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
