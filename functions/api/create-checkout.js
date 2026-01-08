// Cloudflare Pages Function for creating Stripe checkout sessions
// Add STRIPE_SECRET_KEY in Cloudflare Pages environment variables

import Stripe from 'stripe'
import { sendOrderEmail, sendPurchaseFailureAlert } from '../utils/email.js'
import { detectStripeKeyMode } from '../utils/stripe-validation.js'

// Helper functions
async function loadOrders(kv) {
  if (!kv) {
    console.warn('ORDERS_KV not bound, returning empty array')
    return []
  }
  try {
    const data = await kv.get('orders', 'json')
    return data || []
  } catch (error) {
    console.error('Error loading orders from KV:', error)
    return []
  }
}

async function saveOrders(kv, orders) {
  if (!kv) {
    console.warn('ORDERS_KV not bound, cannot save orders')
    return
  }
  try {
    await kv.put('orders', JSON.stringify(orders))
  } catch (error) {
    console.error('Error saving orders to KV:', error)
    throw error
  }
}

function generateOrderNumber(orders) {
  const year = new Date().getFullYear()
  const yearOrders = orders.filter(o => {
    const orderYear = new Date(o.createdAt).getFullYear()
    return orderYear === year
  })
  const nextNum = (yearOrders.length + 1).toString().padStart(3, '0')
  return `ORD-${year}-${nextNum}`
}

export async function onRequestPost(context) {
  const { request, env } = context
  
  // Store body for potential error reporting (can only read once)
  let requestBody = null
  let line_items = null
  let customer_email = null
  let customer_name = null
  let shipping_address = null
  let shipping_name = null
  let success_url = null
  let cancel_url = null
  let metadata = null
  
  try {
    // Validate Stripe key
    if (!env.STRIPE_SECRET_KEY) {
      console.error('[Stripe] STRIPE_SECRET_KEY not found in environment variables')
      return new Response(JSON.stringify({
        message: 'Stripe secret key not configured. Please set STRIPE_SECRET_KEY in Cloudflare Pages environment variables.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate and log key mode
    const keyMode = detectStripeKeyMode(env.STRIPE_SECRET_KEY)
    if (keyMode === 'unknown') {
      console.warn('[Stripe] Warning: Unable to detect key mode. Key should start with sk_test_ or sk_live_')
    } else {
      console.log(`[Stripe] Using ${keyMode.toUpperCase()} mode secret key`)
      
      // Warn if using test key in production (Cloudflare Pages is typically production)
      if (keyMode === 'test') {
        console.warn('[Stripe] ⚠️  WARNING: Using TEST key in production environment!')
        console.warn('[Stripe] For production, use a LIVE key (sk_live_...) from your Stripe Dashboard.')
        console.warn('[Stripe] Update STRIPE_SECRET_KEY in Cloudflare Pages → Settings → Environment Variables.')
      } else if (keyMode === 'live') {
        console.log('[Stripe] ✓ Using LIVE key - ready for real payments')
        console.log('[Stripe] Note: Test cards (e.g., 4242 4242 4242 4242) will be REJECTED with live keys.')
        console.log('[Stripe] Use real credit cards for testing, or enable test mode in Stripe Dashboard.')
      }
    }

    // Initialize Stripe with Workers-compatible HTTP client
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2024-06-20'
    })

    requestBody = await request.json()
    ({ 
      line_items, 
      customer_email, 
      customer_name,
      shipping_address,
      shipping_name,
      success_url, 
      cancel_url, 
      metadata 
    } = requestBody)

    // Get origin from request headers
    const origin = request.headers.get('origin') || request.headers.get('referer') || ''

    // Calculate totals from line items
    const subtotal = line_items.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount * item.quantity) / 100
    }, 0)

    // Load existing orders
    const orders = await loadOrders(env.ORDERS_KV)
    
    // Generate order number
    const orderNumber = generateOrderNumber(orders)
    const now = new Date().toISOString()

    // Prepare session parameters (with session_id in success URL)
    const baseSuccessUrl = success_url || new URL('/success', origin || request.url).href
    const successUrlWithSession = baseSuccessUrl.includes('{CHECKOUT_SESSION_ID}') 
      ? baseSuccessUrl 
      : `${baseSuccessUrl}${baseSuccessUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`

    const sessionParams = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrlWithSession,
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

    // Create Stripe Checkout session first to get session ID
    const session = await stripe.checkout.sessions.create(sessionParams)

    // Create order object
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stripeSessionId: session.id,
      stripePaymentIntentId: null,
      orderNumber: orderNumber,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      customer: {
        name: customer_name || metadata?.customer_name || '',
        email: customer_email || metadata?.customer_email || '',
        phone: metadata?.customer_phone || ''
      },
      shipping: {
        name: shipping_name || customer_name || metadata?.customer_name || '',
        address: shipping_address || (metadata?.shipping_address ? JSON.parse(metadata.shipping_address) : {
          line1: '',
          line2: null,
          city: '',
          state: '',
          postal_code: '',
          country: 'US'
        })
      },
      items: line_items.map(item => ({
        name: item.price_data.product_data.name,
        sku: metadata?.cart_items ? JSON.parse(metadata.cart_items).find(ci => ci.name === item.price_data.product_data.name)?.sku || 'N/A' : 'N/A',
        quantity: item.quantity,
        price: item.price_data.unit_amount / 100,
        total: (item.price_data.unit_amount * item.quantity) / 100
      })),
      totals: {
        subtotal: subtotal,
        shipping: 0,
        tax: 0,
        total: subtotal
      },
      currency: line_items[0]?.price_data?.currency || 'usd',
      notes: metadata?.order_notes || ''
    }

    // Save order to KV
    orders.push(order)
    await saveOrders(env.ORDERS_KV, orders)

    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Stripe error:', error)
    
    // Send failure alert email (only in production/live mode)
    try {
      const keyMode = env.STRIPE_SECRET_KEY ? detectStripeKeyMode(env.STRIPE_SECRET_KEY) : 'unknown'
      
      // Only send alerts in production (live mode) to avoid spam during development
      if (keyMode === 'live') {
        // Extract order information from request body for error details
        let errorDetails = {
          errorType: 'Checkout Session Creation Failed',
          errorMessage: error.message || 'Unknown error occurred',
          currency: requestBody?.line_items?.[0]?.price_data?.currency || 'usd'
        }

        // Use stored request body data if available
        if (requestBody) {
          errorDetails.customerName = requestBody.customer_name || requestBody.metadata?.customer_name
          errorDetails.customerEmail = requestBody.customer_email || requestBody.metadata?.customer_email
          errorDetails.customerPhone = requestBody.metadata?.customer_phone
          
          if (requestBody.line_items) {
            errorDetails.items = requestBody.line_items.map(item => ({
              name: item.price_data?.product_data?.name || 'Unknown Item',
              quantity: item.quantity || 1,
              price: (item.price_data?.unit_amount || 0) / 100
            }))
            
            errorDetails.subtotal = requestBody.line_items.reduce((sum, item) => {
              return sum + (item.price_data?.unit_amount || 0) / 100 * (item.quantity || 1)
            }, 0)
          }
          
          if (requestBody.shipping_address) {
            errorDetails.shippingAddress = requestBody.shipping_address
          } else if (requestBody.metadata?.shipping_address) {
            try {
              errorDetails.shippingAddress = JSON.parse(requestBody.metadata.shipping_address)
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        // Send failure alert email (don't await - send async so it doesn't delay response)
        sendPurchaseFailureAlert(errorDetails, env).then(result => {
          if (result.success) {
            console.log('Purchase failure alert sent successfully')
          } else {
            console.error('Failed to send purchase failure alert:', result.error)
          }
        }).catch(emailError => {
          console.error('Error sending purchase failure alert:', emailError)
        })
      } else {
        console.log(`Skipping failure alert email (key mode: ${keyMode}, not production)`)
      }
    } catch (alertError) {
      console.error('Error setting up failure alert:', alertError)
      // Don't fail the error response if alert setup fails
    }
    
    return new Response(JSON.stringify({
      message: error.message || 'Failed to create checkout session'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
