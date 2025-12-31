<template>
  <div class="content-area primary">
    <main class="site-main main" role="main">
      <div>
        <h1>Thank You for Your Order!</h1>
        <div v-if="finalizing && !error">
          <p>Processing your order...</p>
        </div>
        <div v-else-if="error">
          <p class="error-message">{{ error }}</p>
          <p>Your payment was successful, but there was an issue processing your order. Please contact us with your order details.</p>
        </div>
        <div v-else-if="finalized">
          <p>Your order has been received and confirmed!</p>
          <p>You will receive an email confirmation shortly.</p>
        </div>
        <div v-else>
          <p>Your order has been received and we'll process it shortly.</p>
        </div>
		<div>
			<p>If you have and questions, comments, or concerns, please contact Farmer J directly at (678) 927-3289 or <a href="mailto:farmerjsbotanicals@gmail.com">farmerjsbotanicals@gmail.com</a>.</p>
		</div>
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '../composables/useCart'

export default {
  name: 'Success',
  setup() {
    const route = useRoute()
    const { clearCart } = useCart()
    const finalizing = ref(false)
    const finalized = ref(false)
    const error = ref(null)

    const finalizeOrder = async () => {
      const sessionId = route.query.session_id

      if (!sessionId) {
        console.warn('No session_id in URL')
        // Still clear cart even if no session ID
        clearCart()
        return
      }

      finalizing.value = true
      error.value = null

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api/finalize-order'
        const response = await fetch(`${apiUrl}?session_id=${sessionId}`, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to finalize order')
        }

        const data = await response.json()
        finalized.value = true

        // Clear cart after successful order finalization
        clearCart()
      } catch (err) {
        console.error('Error finalizing order:', err)
        error.value = err.message || 'An error occurred while finalizing your order'
      } finally {
        finalizing.value = false
      }
    }

    onMounted(() => {
      finalizeOrder()
    })

    return {
      finalizing,
      finalized,
      error
    }
  }
}
</script>

<style scoped lang="scss">
	.error-message {
	color: #c00;
	font-weight: 600;
	margin: 1rem 0;
	}

</style>

