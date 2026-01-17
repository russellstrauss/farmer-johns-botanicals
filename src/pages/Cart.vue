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
								<th>Size</th>
								<th>Price</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, index) in cartItems" :key="index">
								<td class="product-image">
									<router-link :to="`/product/${item.slug}`" class="product-link">
										<img :src="item.image || '/assets/images/placeholder.jpg'" :alt="item.name"
											class="cart-item-image" />
										<strong>{{ item.name }}</strong>
									</router-link>
								</td>
								<td class="size" data-label="Size:">
									<span v-if="item.variation && item.variation.size">{{ item.variation.size }}</span>
									<span v-else>-</span>
								</td>
								<td class="price" data-label="Price:">{{ formatPrice(item.price) }}</td>
								<td class="remove">
									<div>
										<button class="button" @click="removeItem(index)">Remove</button>
									</div>
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td colspan="2"><strong>Subtotal</strong></td>
								<td></td>
								<td class="total-price" data-label="Subtotal:"><strong>{{ formatPrice(getTotal()) }}</strong></td>
							</tr>
							<tr>
								<td colspan="2"><strong>Shipping (USPS Priority Mail)</strong></td>
								<td></td>
								<td class="total-price" data-label="Shipping:"><strong>{{ formatPrice(getShippingCost()) }}</strong></td>
							</tr>
							<tr>
								<td colspan="2"><strong>Total</strong></td>
								<td></td>
								<td class="total-price" data-label="Total:"><strong>{{ formatPrice(getTotalWithShipping()) }}</strong></td>
							</tr>
						</tfoot>
					</table>
					<div v-if="cartItems.length > 0" class="cart-actions">
						<button class="button checkout-button" @click="handleCheckout" :disabled="cartItems.length === 0">
							Proceed to Checkout
						</button>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { useDialog } from '../composables/useDialog'

export default {
	name: 'Cart',
	setup() {
		const router = useRouter()
		const {
			cart,
			removeItem: removeCartItem,
			updateQuantity: updateCartQuantity,
			getTotal,
			formatPrice
		} = useCart()
		const { alert } = useDialog()

		const cartItems = cart

		const removeItem = (index) => {
			removeCartItem(index)
		}

		const updateQuantity = (index, quantity) => {
			updateCartQuantity(index, parseInt(quantity))
		}

		const getTotalShirtCount = () => {
			return cartItems.value.reduce((total, item) => {
				return total + (item.quantity || 1)
			}, 0)
		}

		const getShippingCost = () => {
			const shirtCount = getTotalShirtCount()
			if (shirtCount <= 3) {
				return 10
			} else if (shirtCount <= 8) {
				return 20
			} else {
				return 30
			}
		}

		const getTotalWithShipping = () => {
			return getTotal() + getShippingCost()
		}

		const handleCheckout = async () => {
			if (cartItems.value.length === 0) {
				await alert('Your cart is empty', 'Cart Empty')
				return
			}
			router.push('/checkout')
		}

		return {
			cartItems,
			getTotal,
			getShippingCost,
			getTotalWithShipping,
			formatPrice,
			removeItem,
			updateQuantity,
			handleCheckout
		}
	}
}
</script>
