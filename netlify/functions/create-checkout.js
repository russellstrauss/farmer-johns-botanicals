// Netlify serverless function for creating Stripe checkout sessions
// Make sure to set STRIPE_SECRET_KEY in Netlify environment variables

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  try {
    const { line_items, customer_email, success_url, cancel_url, metadata } = JSON.parse(event.body)

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: success_url || `${event.headers.origin || event.headers.referer}/success`,
      cancel_url: cancel_url || `${event.headers.origin || event.headers.referer}/cart`,
      customer_email: customer_email || undefined,
      metadata: metadata || {}
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id
      })
    }
  } catch (error) {
    console.error('Stripe error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message || 'Failed to create checkout session'
      })
    }
  }
}

