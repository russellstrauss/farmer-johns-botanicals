<template>
	<div class="content-area primary">
		<main class="site-main main" role="main">
			<h1>Shopping Cart</h1>

			<div class="cart-container">
				<div v-if="cartItems.length === 0" class="cart-empty">
					<p>Your cart is empty.</p>
					<router-link to="/shop" class="button">Continue Shopping</router-link>
				</div>
				<div v-else-if="cartItems.length > 0" class="cart-items">
					<table class="cart-table">
						<thead>
							<tr>
								<th>Product</th>
								<th>Price</th>
								<th>Quantity</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, index) in cartItems" :key="index">
								<td class="product-image">
									<img :src="item.image || '/assets/images/placeholder.jpg'" :alt="item.name"
										class="cart-item-image" />
									<strong>{{ item.name }}</strong>
								</td>
								<td class="price" data-label="Price:">{{ formatPrice(item.price) }}</td>
								<td class="quantity" data-label="Quantity:">
									<input type="number" min="1" :value="item.quantity"
										@change="updateQuantity(index, $event.target.value)" class="quantity-input" />
								</td>
								<td>
									<button class="button" @click="removeItem(index)">Remove</button>
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td colspan="2"><strong>Total</strong></td>
								<td></td>
								<td class="total-price"><strong>{{ formatPrice(getTotal()) }}</strong></td>
							</tr>
						</tfoot>
					</table>
					<div v-if="cartItems.length > 0" class="cart-actions">
						<button class="button checkout-button" @click="handleCheckout" :disabled="processing || cartItems.length === 0">
							{{ processing ? 'Processing...' : 'Proceed to Checkout' }}
						</button>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useCart } from '../composables/useCart'
import { useStripe } from '../composables/useStripe'

export default {
	name: 'Cart',
	setup() {
		const {
			cart,
			removeItem: removeCartItem,
			updateQuantity: updateCartQuantity,
			getTotal,
			formatPrice
		} = useCart()
		const { createCheckoutSession } = useStripe()
		const processing = ref(false)

		const cartItems = cart

		const removeItem = (index) => {
			removeCartItem(index)
		}

		const updateQuantity = (index, quantity) => {
			updateCartQuantity(index, parseInt(quantity))
		}


		const handleCheckout = async () => {
			if (cartItems.value.length === 0) {
				alert('Your cart is empty')
				return
			}

			processing.value = true
			try {
				await createCheckoutSession(cartItems.value)
			} catch (error) {
				console.error('Checkout error:', error)
			} finally {
				processing.value = false
			}
		}

		return {
			cartItems,
			getTotal,
			formatPrice,
			removeItem,
			updateQuantity,
			handleCheckout,
			processing
		}
	}
}
</script>
