// Cloudflare Pages Function for managing orders
// GET: Fetch all orders (requires auth)
// POST: Save orders array (requires auth)

function verifyAdminAuth(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.substring(7)
  return token && token.length > 0
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

export async function onRequestGet(context) {
  const { request, env } = context

  // Verify authentication
  if (!verifyAdminAuth(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const orders = await loadOrders(env.ORDERS_KV)
    // Sort by date, newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return new Response(JSON.stringify({
      success: true,
      orders: orders
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error loading orders:', error)
    return new Response(JSON.stringify({
      message: error.message || 'Failed to load orders'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function onRequestPost(context) {
  const { request, env } = context

  // Verify authentication
  if (!verifyAdminAuth(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { orders } = body

    if (!orders || !Array.isArray(orders)) {
      return new Response(JSON.stringify({ 
        message: 'Invalid request: orders array required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await saveOrders(env.ORDERS_KV, orders)

    return new Response(JSON.stringify({
      success: true,
      message: 'Orders saved successfully',
      count: orders.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error saving orders:', error)
    return new Response(JSON.stringify({
      message: error.message || 'Failed to save orders'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context

  // Verify authentication
  if (!verifyAdminAuth(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('id')

    if (!orderId) {
      return new Response(JSON.stringify({ 
        message: 'Invalid request: order ID required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const orders = await loadOrders(env.ORDERS_KV)
    const filteredOrders = orders.filter(o => o.id !== orderId)

    if (filteredOrders.length === orders.length) {
      return new Response(JSON.stringify({ 
        message: 'Order not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await saveOrders(env.ORDERS_KV, filteredOrders)

    return new Response(JSON.stringify({
      success: true,
      message: 'Order deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return new Response(JSON.stringify({
      message: error.message || 'Failed to delete order'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

