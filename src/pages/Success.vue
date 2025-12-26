<template>
  <div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">
      <div class="success-page">
        <h1>Thank You for Your Order!</h1>
        <p>Your order has been received and we'll process it shortly.</p>
        <p>You will receive an email confirmation shortly.</p>
        <router-link to="/shop" class="button">Continue Shopping</router-link>
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useCart } from '../composables/useCart'

export default {
  name: 'Success',
  setup() {
    const { clearCart } = useCart()

    onMounted(() => {
      // Clear cart after successful order
      clearCart()
    })

    return {}
  }
}
</script>


