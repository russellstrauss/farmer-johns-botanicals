<template>
	<li class="product">
		<router-link :to="`/product/${product.slug}`">
			<div class="product-image-wrapper" :style="{ backgroundImage: `url(${getProductImage(product)})` }">
				<img :src="getProductImage(product)" :alt="product.name" />
			</div>
			<span v-if="product.sale_price" class="sale-badge">Sale</span>
			<h3 class="product-title">{{ product.name }}</h3>
			<span class="price">
				<span class="amount">
					<span v-if="product.sale_price" class="sale-price">{{ formatPrice(product.sale_price) }}</span>
					<span :class="{ 'regular-price': product.sale_price }">{{ formatPrice(product.price) }}</span>
				</span>
			</span>
		</router-link>
	</li>
</template>

<script>
import { useCart } from '../composables/useCart'

export default {
	name: 'ProductCard',
	props: {
		product: {
			type: Object,
			required: true
		}
	},
	setup() {
		const { formatPrice } = useCart()

		const getProductImage = (product) => {
			return product.images && product.images.length > 0
				? product.images[0]
				: '/assets/images/placeholder.jpg'
		}

		return {
			getProductImage,
			formatPrice
		}
	}
}
</script>





