<template>
	<div class="content-area primary">
		<main class="site-main main" role="main">
			<h1>Shopping Cart</h1>

			<div class="cart-container">
				<div v-if="isEmpty()" class="cart-empty">
					<p>Your cart is empty.</p>
					<router-link to="/shop" class="button">Continue Shopping</router-link>
				</div>
				<div v-else class="cart-items">
					<table class="cart-table">
						<thead>
							<tr>
								<th>Product</th>
								<th>Price</th>
								<th>Quantity</th>
								<th>Subtotal</th>
								<th></th>
							</tr>
						</thead>
						<tbody class="cart-items-body">
							<tr v-for="(item, index) in cartItems" :key="index">
								<td>
									<img :src="item.image || '/assets/images/placeholder.jpg'" :alt="item.name"
										class="cart-item-image" />
									<strong>{{ item.name }}</strong>
								</td>
								<td>{{ formatPrice(item.price) }}</td>
								<td>
									<input type="number" min="1" :value="item.quantity"
										@change="updateQuantity(index, $event.target.value)" class="quantity-input" />
								</td>
								<td>{{ formatPrice(item.price * item.quantity) }}</td>
								<td>
									<button class="remove-item-btn" @click="removeItem(index)">Remove</button>
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td colspan="3"><strong>Total</strong></td>
								<td></td>
								<td class="total-price"><strong>{{ formatPrice(getTotal()) }}</strong></td>
							</tr>
						</tfoot>
					</table>
					<div class="cart-actions">
						<button class="button checkout-button" @click="handleCheckout" :disabled="processing">
							{{ processing ? 'Processing...' : 'Proceed to Checkout' }}
						</button>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useCart } from '../composables/useCart'
import { useStripe } from '../composables/useStripe'

export default {
	name: 'Cart',
	setup() {
		const {
			cart,
			getItems,
			removeItem: removeCartItem,
			updateQuantity: updateCartQuantity,
			isEmpty,
			getTotal,
			formatPrice
		} = useCart()
		const { createCheckoutSession } = useStripe()
		const processing = ref(false)

		const cartItems = computed(() => getItems())

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
			isEmpty,
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
