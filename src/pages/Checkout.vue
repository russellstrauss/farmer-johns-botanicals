<template>
	<div class="content-area primary">
		<main class="site-main main" role="main">
			<div class="checkout-container">
				<h1>Checkout</h1>

				<div v-if="cartItems.length === 0" class="empty-cart">
					<p>Your cart is empty.</p>
					<router-link to="/shop" class="button">Continue Shopping</router-link>
				</div>

				<div v-else class="checkout-content">
					<form @submit.prevent="handleSubmit" class="checkout-form">
						<!-- Customer Information -->
						<section class="form-section">
							<h2>Customer Information</h2>

							<div class="form-row">
								<div class="form-group" :class="{ 'error': fieldErrors.firstName }">
									<label for="firstName">First Name <span class="required-indicator">*</span></label>
									<input id="firstName" v-model="form.firstName" type="text"
										:class="{ 'error': fieldErrors.firstName }"
										@input="fieldErrors.firstName = false"
										autocomplete="given-name" placeholder="First Name" />
									<p v-if="fieldErrors.firstName" class="error-message">First Name is required.</p>
								</div>

								<div class="form-group" :class="{ 'error': fieldErrors.lastName }">
									<label for="lastName">Last Name <span class="required-indicator">*</span></label>
									<input id="lastName" v-model="form.lastName" type="text"
										:class="{ 'error': fieldErrors.lastName }"
										@input="fieldErrors.lastName = false"
										autocomplete="family-name" placeholder="Last Name" />
									<p v-if="fieldErrors.lastName" class="error-message">Last Name is required.</p>
								</div>
							</div>

							<div class="form-group" :class="{ 'error': fieldErrors.email }">
								<label for="email">Email <span class="required-indicator">*</span></label>
								<input id="email" v-model="form.email" type="email"
									:class="{ 'error': fieldErrors.email }"
									@input="fieldErrors.email = false"
									autocomplete="email" placeholder="your@email.com" />
								<p v-if="fieldErrors.email" class="error-message">Email is required.</p>
							</div>

							<div class="form-group" :class="{ 'error': fieldErrors.phone }">
								<label for="phone">Phone <span class="required-indicator">*</span></label>
								<input id="phone" v-model="form.phone" type="tel"
									:class="{ 'error': fieldErrors.phone }"
									@input="fieldErrors.phone = false"
									autocomplete="tel" placeholder="(555) 123-4567" />
								<p v-if="fieldErrors.phone" class="error-message">Phone is required.</p>
							</div>
						</section>

						<!-- Shipping Address -->
						<section class="form-section">
							<h2>Shipping Address</h2>

							<div class="form-group" :class="{ 'error': fieldErrors.address }">
								<label for="address">Street Address <span class="required-indicator">*</span></label>
								<input id="address" v-model="form.address" type="text"
									:class="{ 'error': fieldErrors.address }"
									@input="fieldErrors.address = false"
									autocomplete="street-address" placeholder="123 Main St" />
								<p v-if="fieldErrors.address" class="error-message">Street Address is required.</p>
							</div>

							<div class="form-group">
								<label for="address2">Apartment, suite, etc. (Optional)</label>
								<input id="address2" v-model="form.address2" type="text" autocomplete="address-line2"
									placeholder="Apt 4B" />
							</div>

							<div class="form-row">
								<div class="form-group" :class="{ 'error': fieldErrors.city }">
									<label for="city">City <span class="required-indicator">*</span></label>
									<input id="city" v-model="form.city" type="text"
										:class="{ 'error': fieldErrors.city }"
										@input="fieldErrors.city = false"
										autocomplete="address-level2" placeholder="City" />
									<p v-if="fieldErrors.city" class="error-message">City is required.</p>
								</div>

								<div class="form-group" :class="{ 'error': fieldErrors.state }">
									<label for="state">State/Province <span class="required-indicator">*</span></label>
									<input id="state" v-model="form.state" type="text"
										:class="{ 'error': fieldErrors.state }"
										@input="fieldErrors.state = false"
										autocomplete="address-level1" placeholder="State" />
									<p v-if="fieldErrors.state" class="error-message">State/Province is required.</p>
								</div>
							</div>

							<div class="form-row">
								<div class="form-group" :class="{ 'error': fieldErrors.postalCode }">
									<label for="postalCode">Postal Code <span class="required-indicator">*</span></label>
									<input id="postalCode" v-model="form.postalCode" type="text"
										:class="{ 'error': fieldErrors.postalCode }"
										@input="fieldErrors.postalCode = false"
										autocomplete="postal-code" placeholder="12345" />
									<p v-if="fieldErrors.postalCode" class="error-message">Postal Code is required.</p>
								</div>

								<div class="form-group" :class="{ 'error': fieldErrors.country }">
									<label for="country">Country <span class="required-indicator">*</span></label>
									<select id="country" v-model="form.country"
										:class="{ 'error': fieldErrors.country }"
										@change="fieldErrors.country = false"
										autocomplete="country">
										<option value="">Select Country</option>
										<option value="US">United States</option>
										<option value="CA">Canada</option>
										<option value="GB">United Kingdom</option>
										<option value="AU">Australia</option>
										<option value="DE">Germany</option>
										<option value="FR">France</option>
										<option value="IT">Italy</option>
										<option value="ES">Spain</option>
										<option value="NL">Netherlands</option>
										<option value="BE">Belgium</option>
										<option value="AT">Austria</option>
										<option value="CH">Switzerland</option>
										<option value="SE">Sweden</option>
										<option value="NO">Norway</option>
										<option value="DK">Denmark</option>
										<option value="FI">Finland</option>
										<option value="IE">Ireland</option>
										<option value="NZ">New Zealand</option>
										<option value="JP">Japan</option>
									</select>
									<p v-if="fieldErrors.country" class="error-message">Country is required.</p>
								</div>
							</div>
						</section>

						<!-- Order Summary -->
						<section class="order-summary">
							<h2>Order Summary</h2>
							<div class="summary-items">
								<div v-for="(item, index) in cartItems" :key="index" class="summary-item">
									<div class="item-info">
										<span class="item-name">{{ item.name }}</span>
									</div>
									<div class="item-size">
										<span v-if="item.variation && item.variation.size">{{ item.variation.size }}</span>
										<span v-else>-</span>
									</div>
									<div class="item-price">{{ formatPrice(item.price * item.quantity) }}</div>
								</div>
							</div>
							<div class="summary-total">
								<strong>Total: {{ formatPrice(getTotal()) }}</strong>
							</div>
						</section>

						<div v-if="error" class="form-error">
							{{ error }}
						</div>

						<div class="form-actions">
							<router-link to="/cart" class="button secondary">Back to Cart</router-link>
							<button type="submit" class="button primary" :disabled="processing">
								{{ processing ? 'Processing...' : 'Proceed to Payment' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</main>
	</div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { useStripe } from '../composables/useStripe'

export default {
	name: 'Checkout',
	setup() {
		const router = useRouter()
		const { cart, getTotal, formatPrice } = useCart()
		const { createCheckoutSession } = useStripe()

		const cartItems = cart
		const processing = ref(false)
		const error = ref('')

		const form = ref({
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			address: '',
			address2: '',
			city: '',
			state: '',
			postalCode: '',
			country: 'US'
		})

		const fieldErrors = ref({
			firstName: false,
			lastName: false,
			email: false,
			phone: false,
			address: false,
			city: false,
			state: false,
			postalCode: false,
			country: false
		})

		const validateForm = () => {
			let isValid = true
			
			// Reset all errors
			Object.keys(fieldErrors.value).forEach(key => {
				fieldErrors.value[key] = false
			})

			// Validate required fields
			if (!form.value.firstName.trim()) {
				fieldErrors.value.firstName = true
				isValid = false
			}

			if (!form.value.lastName.trim()) {
				fieldErrors.value.lastName = true
				isValid = false
			}

			if (!form.value.email.trim()) {
				fieldErrors.value.email = true
				isValid = false
			}

			if (!form.value.phone.trim()) {
				fieldErrors.value.phone = true
				isValid = false
			}

			if (!form.value.address.trim()) {
				fieldErrors.value.address = true
				isValid = false
			}

			if (!form.value.city.trim()) {
				fieldErrors.value.city = true
				isValid = false
			}

			if (!form.value.state.trim()) {
				fieldErrors.value.state = true
				isValid = false
			}

			if (!form.value.postalCode.trim()) {
				fieldErrors.value.postalCode = true
				isValid = false
			}

			if (!form.value.country) {
				fieldErrors.value.country = true
				isValid = false
			}

			return isValid
		}

		const handleSubmit = async () => {
			error.value = ''

			if (cartItems.value.length === 0) {
				error.value = 'Your cart is empty'
				return
			}

			// Validate form
			if (!validateForm()) {
				// Scroll to first error
				await nextTick()
				const firstErrorField = document.querySelector('.form-group.error input, .form-group.error select')
				if (firstErrorField) {
					firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
					firstErrorField.focus()
				}
				return
			}

			processing.value = true

			try {
				const customerDetails = {
					name: `${form.value.firstName} ${form.value.lastName}`,
					email: form.value.email,
					phone: form.value.phone,
					shipping: {
						name: `${form.value.firstName} ${form.value.lastName}`,
						address: {
							line1: form.value.address,
							line2: form.value.address2 || undefined,
							city: form.value.city,
							state: form.value.state,
							postal_code: form.value.postalCode,
							country: form.value.country
						}
					}
				}

				await createCheckoutSession(cartItems.value, customerDetails)
			} catch (err) {
				error.value = err.message || 'An error occurred during checkout'
				console.error('Checkout error:', err)
			} finally {
				processing.value = false
			}
		}

		return {
			cartItems,
			form,
			fieldErrors,
			processing,
			error,
			getTotal,
			formatPrice,
			handleSubmit
		}
	}
}
</script>

<style scoped lang="scss">
	@import '../assets/sass/_vars.scss';
	@import '../assets/sass/_mixins.scss';
	
	.checkout-container {
		max-width: 800px;
		margin: 0 auto;
		
		h1 {
			margin-bottom: 2rem;
		}
		
		.empty-cart {
			text-align: center;
			padding: 3rem 1rem;
		}
	
		.empty-cart p {
			margin-bottom: 1rem;
			font-size: 1.2rem;
		}
	
		.checkout-content {
			display: grid;
			gap: 2rem;
		}
	
		.checkout-form {
			display: flex;
			flex-direction: column;
			gap: 2rem;
		}
	
		.form-section {
			background: #f9f9f9;
			padding: 1.5rem;
			border-radius: 8px;
			border: 1px solid #e0e0e0;
		}
	
		.form-section h2 {
			margin: 0 0 1.5rem 0;
			font-size: 1.3rem;
			border-bottom: 2px solid #333;
			padding-bottom: 0.5rem;
		}
	
		.form-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem;
		}
	
		.form-group {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;

			label {
				font-weight: 600;
				color: #333;
				font-size: 0.95rem;
			}
		}

		.form-section > .form-group:not(:first-child),
		.form-section > .form-row:not(:first-child) {
			margin-top: 10px;
		}
	
		.required-indicator {
			color: #dc3545;
			font-weight: bold;
		}
	
		.form-group input, .form-group select {
			padding: 0.75rem;
			border: 1px solid #ddd;
			border-radius: 4px;
			font-size: 1rem;
			font-family: inherit;
			transition: border-color 0.2s;
		}
	
		.form-group input:focus, .form-group select:focus {
			outline: none;
			border-color: var(--accent-color, #0098d6);
			box-shadow: 0 0 0 2px rgba(0, 152, 214, 0.2);
		}

		.form-group.error {
			input, select {
				border-color: #dc3545;
				box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
				animation: shake 0.4s ease-in-out;
			}

			label {
				color: #dc3545;
			}
		}

		.error-message {
			margin-top: 0.5rem;
			color: #dc3545;
			font-size: 0.875rem;
			margin-bottom: 0;
			font-weight: 500;
		}

		@keyframes shake {
			0%, 100% {
				transform: translateX(0);
			}
			10%, 30%, 50%, 70%, 90% {
				transform: translateX(-5px);
			}
			20%, 40%, 60%, 80% {
				transform: translateX(5px);
			}
		}
	
		.form-group select {
			cursor: pointer;
			background: white;
		}
	
		.order-summary {
			background: #f9f9f9;
			padding: 1.5rem;
			border-radius: 8px;
			border: 1px solid #e0e0e0;
		}
	
		.order-summary h2 {
			margin: 0 0 1rem 0;
			font-size: 1.3rem;
			border-bottom: 2px solid #333;
			padding-bottom: 0.5rem;
		}
	
		.summary-items {
			margin-bottom: 1rem;
		}
	
		.summary-item {
			display: grid;
			grid-template-columns: 2fr 1fr 1fr;
			gap: 1rem;
			padding: 0.75rem 0;
			border-bottom: 1px solid #e0e0e0;
		}
	
		.summary-item:last-of-type {
			border-bottom: none;
		}
	
		.item-info {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}
	
		.item-name {
			font-weight: 600;
		}
	
		.item-variation {
			font-size: 0.85rem;
			color: #666;
		}
	
		.item-size, .item-price {
			display: flex;
			align-items: center;
		}
	
		.summary-total {
			padding-top: 1rem;
			border-top: 2px solid #333;
			text-align: right;
			font-size: 1.2rem;
		}

		.form-error {
			padding: 1rem;
			background: #fee;
			color: #dc3545;
			border-radius: 4px;
			border: 1px solid #fcc;
			margin-bottom: 1rem;
		}
	
		.form-actions {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			
			@include mobile-only {
				flex-direction: column;
				padding-top: 1rem;
				border-top: 1px solid #e0e0e0;
				width: 100%;
			}
			
			a {
				@include outline-button;
				color: black;
				text-decoration: none;
				
				@include mobile-only {
					width: 100%;
					box-sizing: border-box;
					min-width: 0;
				}
			}
			
			button {
				@include black-button;
				display: inline-block;
				
				@include mobile-only {
					width: 100%;
					box-sizing: border-box;
					min-width: 0;
				}
			}
		}
	
		.form-row {
			@include mobile-only {
				grid-template-columns: 1fr;
			}
		}
	
		.summary-item {
			@include mobile-only {
				grid-template-columns: 1fr;
				gap: 0.5rem;
			}
		}
	}

</style>
