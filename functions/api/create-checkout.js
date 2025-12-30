// Cloudflare Pages Function for creating Stripe checkout sessions
// Add STRIPE_SECRET_KEY in Cloudflare Pages environment variables

import Stripe from 'stripe'
import { sendOrderEmail } from '../utils/email.js'

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
      notes: ''
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
    return new Response(JSON.stringify({
      message: error.message || 'Failed to create checkout session'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
