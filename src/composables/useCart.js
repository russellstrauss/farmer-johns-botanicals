import { ref, computed } from 'vue'

const STORAGE_KEY = 'fjb_cart'
const cart = ref(loadCart())

function loadCart() {
  try {
    const cartData = localStorage.getItem(STORAGE_KEY)
    return cartData ? JSON.parse(cartData) : []
  } catch (e) {
    console.error('Error loading cart:', e)
    return []
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.value))
    dispatchCartUpdate()
  } catch (e) {
    console.error('Error saving cart:', e)
  }
}

function dispatchCartUpdate() {
  const event = new CustomEvent('cartUpdated', {
    detail: {
      cart: cart.value,
      total: getTotal(),
      itemCount: getItemCount()
    }
  })
  window.dispatchEvent(event)
}

function getTotal() {
  return cart.value.reduce((total, item) => {
    return total + item.price
  }, 0)
}

function getItemCount() {
  return cart.value.length
}

export function useCart() {
  const addItem = (product, quantity = 1, variation = null) => {
    if (!product.slug) {
      console.error('Product missing slug:', product)
    }
    
    const item = {
      id: product.id,
      slug: product.slug,
      sku: product.sku || `PROD-${product.id}`,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      quantity: 1,
      variation: variation || null
    }

    // Always push a new item - no merging
    cart.value.push(item)

    saveCart()
    return cart.value
  }

  const removeItem = (index) => {
    if (index >= 0 && index < cart.value.length) {
      cart.value.splice(index, 1)
      saveCart()
    }
    return cart.value
  }

  const updateQuantity = (index, quantity) => {
    if (index >= 0 && index < cart.value.length) {
      const qty = parseInt(quantity)
      if (qty > 0) {
        cart.value[index].quantity = qty
      } else {
        removeItem(index)
      }
      saveCart()
    }
    return cart.value
  }

  const clearCart = () => {
    cart.value = []
    saveCart()
  }

  const getItems = () => {
    return cart.value
  }

  const isEmpty = () => {
    return cart.value.length === 0
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return {
    cart: computed(() => cart.value),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItems,
    isEmpty,
    getTotal,
    getItemCount,
    formatPrice
  }
}




