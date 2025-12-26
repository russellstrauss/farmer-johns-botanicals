import { loadStripe } from '@stripe/stripe-js'

let stripePromise = null

export function useStripe() {
  const getStripe = () => {
    if (!stripePromise) {
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      if (publishableKey) {
        stripePromise = loadStripe(publishableKey)
      } else {
        console.warn('Stripe publishable key not found')
      }
    }
    return stripePromise
  }

  const createCheckoutSession = async (cartItems, customerEmail = null) => {
    try {
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty')
      }

      const lineItems = cartItems.map(item => {
        // Convert relative image URLs to absolute URLs
        let imageUrl = null
        if (item.image) {
          if (item.image.startsWith('http')) {
            imageUrl = item.image
          } else {
            imageUrl = new URL(item.image, window.location.origin).href
          }
        }
        
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: imageUrl ? [imageUrl] : []
            },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity
        }
      })

      const successUrl = new URL('/success', window.location.origin).href
      const cancelUrl = new URL('/cart', window.location.origin).href

      // Call serverless function to create Stripe Checkout session
      const apiUrl = import.meta.env.VITE_API_URL || '/api/create-checkout'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          line_items: lineItems,
          customer_email: customerEmail,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            cart_items: JSON.stringify(cartItems.map(item => ({
              sku: item.sku,
              name: item.name,
              quantity: item.quantity
            })))
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create checkout session')
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.sessionId) {
        // Alternative: Use Stripe.js redirect
        const stripe = await getStripe()
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
          })
          if (error) {
            throw new Error(error.message)
          }
        }
      } else {
        throw new Error('No checkout URL or session ID returned')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Error starting checkout: ' + error.message)
      throw error
    }
  }

  return {
    getStripe,
    createCheckoutSession
  }
}

