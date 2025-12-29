<template>
	<div v-if="relatedProducts.length > 0" class="related-products">
		<h2 class="related-products-title">Related Products</h2>
		<ul class="products">
			<ProductCard v-for="product in relatedProducts" :key="product.id" :product="product" />
		</ul>
	</div>
</template>

<script>
import { computed } from 'vue'
import { useProducts } from '../composables/useProducts'
import ProductCard from './ProductCard.vue'

export default {
	name: 'RelatedProducts',
	components: {
		ProductCard
	},
	props: {
		productId: {
			type: [String, Number],
			required: true
		},
		limit: {
			type: Number,
			default: 4
		}
	},
	setup(props) {
		const { getRelatedProducts } = useProducts()

		const relatedProducts = computed(() => {
			return getRelatedProducts(props.productId, props.limit)
		})

		return {
			relatedProducts
		}
	}
}
</script>

<style scoped lang="scss">
	.related-products {
		margin-top: 60px;
		padding-top: 40px;
		border-top: 1px solid #e0e0e0;

		.related-products-title {
			margin-bottom: 30px;
			font-size: 24px;
			font-weight: bold;
		}
	}
</style>
