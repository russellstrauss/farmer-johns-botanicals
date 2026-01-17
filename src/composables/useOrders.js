import { ref } from 'vue'
import { useAuth } from './useAuth'

const orders = ref([])
const loading = ref(false)
const error = ref(null)

export function useOrders() {
  const { authToken } = useAuth()

  const loadOrders = async () => {
    loading.value = true
    error.value = null

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/orders'
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.')
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load orders')
      }

      const data = await response.json()
      orders.value = data.orders || []
      return orders.value
    } catch (err) {
      error.value = err.message
      console.error('Error loading orders:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  const updateOrderStatus = async (id, status) => {
    const order = getOrderById(id)
    if (!order) {
      throw new Error('Order not found')
    }

    const updatedOrders = orders.value.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: status,
          updatedAt: new Date().toISOString()
        }
      }
      return o
    })

    await saveOrders(updatedOrders)
    orders.value = updatedOrders
    return getOrderById(id)
  }

  const addOrderNote = async (id, note) => {
    const order = getOrderById(id)
    if (!order) {
      throw new Error('Order not found')
    }

    const updatedOrders = orders.value.map(o => {
      if (o.id === id) {
        return {
          ...o,
          notes: (o.notes || '') + (o.notes ? '\n' : '') + `[${new Date().toLocaleString()}] ${note}`,
          updatedAt: new Date().toISOString()
        }
      }
      return o
    })

    await saveOrders(updatedOrders)
    orders.value = updatedOrders
    return getOrderById(id)
  }

  const deleteOrder = async (id) => {
    const order = getOrderById(id)
    if (!order) {
      throw new Error('Order not found')
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/orders'
      const response = await fetch(`${apiUrl}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.')
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete order')
      }

      // Remove from local state
      orders.value = orders.value.filter(o => o.id !== id)
      return true
    } catch (err) {
      console.error('Error deleting order:', err)
      throw err
    }
  }

  const saveOrders = async (ordersToSave) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/save-orders'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orders: ordersToSave })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.')
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save orders')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error saving orders:', err)
      throw err
    }
  }

  return {
    orders,
    loading,
    error,
    loadOrders,
    getOrderById,
    updateOrderStatus,
    addOrderNote,
    deleteOrder
  }
}



