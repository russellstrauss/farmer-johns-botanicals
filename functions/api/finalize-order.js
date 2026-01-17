// Cloudflare Pages Function for finalizing orders after successful payment
import { sendOrderEmail, sendCustomerConfirmationEmail } from '../utils/email.js'

export async function onRequestGet(context) {
  return handleFinalizeOrder(context)
}

export async function onRequestPost(context) {
  return handleFinalizeOrder(context)
}

async function handleFinalizeOrder(context) {
  const { request, env } = context
  const url = new URL(request.url)

  try {
    const sessionId = url.searchParams.get('session_id')

    if (!sessionId) {
      return new Response(JSON.stringify({ 
        message: 'session_id parameter required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Load orders from KV
    const orders = await loadOrders(env.ORDERS_KV)
    const orderIndex = orders.findIndex(o => o.stripeSessionId === sessionId)

    if (orderIndex === -1) {
      return new Response(JSON.stringify({ 
        message: 'Order not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const order = orders[orderIndex]

    // Only finalize if status is pending
    if (order.status === 'pending') {
      order.status = 'paid'
      order.updatedAt = new Date().toISOString()
      orders[orderIndex] = order
      await saveOrders(env.ORDERS_KV, orders)

      // Send email notifications (admin and customer)
      // Send both emails independently so one failure doesn't prevent the other
      try {
        await sendOrderEmail(order, env)
      } catch (error) {
        console.error('Failed to send admin email notification:', error)
      }
      
      try {
        await sendCustomerConfirmationEmail(order, env)
      } catch (error) {
        console.error('Failed to send customer confirmation email:', error)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      order: order
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error finalizing order:', error)
    return new Response(JSON.stringify({
      message: error.message || 'Failed to finalize order'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

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



