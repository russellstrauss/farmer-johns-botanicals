<template>
	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">
			<div v-if="product">
				<div class="product">
					<div class="product-images">
						<div id="product-gallery" class="product-gallery">
							<!-- Hidden gallery links for PhotoSwipe -->
							<a v-for="(image, index) in product.images" :key="`gallery-link-${index}`" :href="image"
								:data-pswp-src="image" :data-pswp-width="imageDimensions[index]?.width || 1200"
								:data-pswp-height="imageDimensions[index]?.height || 1200"
								:alt="`${product.name} ${index + 1}`" class="gallery-link pswp-gallery-item"
								style="position: absolute; left: -9999px; opacity: 0;"></a>

							<!-- Main image viewer -->
							<div class="main-image-viewer">
								<a href="#" @click.prevent="openPhotoSwipe(selectedImageIndex)" class="main-image-link"
									:style="{ backgroundImage: `url(${product.images[selectedImageIndex]})` }"
									data-pswp-ignore>
									<img :src="product.images[selectedImageIndex]" :alt="`${product.name} - Main view`"
										class="main-image" />
								</a>
							</div>

							<!-- Thumbnail gallery -->
							<div class="thumbnail-gallery" v-if="product.images.length > 1">
								<button v-for="(image, index) in product.images" :key="`thumb-${index}`"
									@click="selectedImageIndex = index"
									:class="['thumbnail-button', { active: selectedImageIndex === index }]" type="button">
									<img :src="image" :alt="`${product.name} thumbnail ${index + 1}`"
										class="thumbnail-image" />
								</button>
							</div>
						</div>
					</div>
					<div class="summary">
						<h1>{{ product.name }}</h1>
						<div class="price">
							<span class="amount">
								<span v-if="product.sale_price" class="sale-price">{{ formatPrice(product.sale_price)
								}}</span>
								<span :class="{ 'regular-price': product.sale_price }">{{ formatPrice(product.price)
								}}</span>
							</span>
						</div>
						<div class="product-short-description" v-html="formatDescription(product.short_description)"></div>
						<div v-if="product.in_stock" class="stock in-stock">In Stock</div>
						<div v-else class="stock out-of-stock">Out of Stock</div>
						<div class="product-actions">
							<div class="quantity">
								<input type="number" id="quantity" class="qty" v-model.number="quantity" min="1"
									:max="product.stock_quantity || 999" />
							</div>
							<button class="button alt single_add_to_cart_button" @click="addToCart"
								:disabled="!product.in_stock">
								Add to Cart
							</button>
						</div>
						<div v-if="product.categories && product.categories.length > 0" class="product_meta">
							Categories:
							<router-link v-for="category in product.categories" :key="category.slug"
								:to="`/shop?category=${category.slug}`">
								{{ category.name }}
							</router-link>
						</div>
					</div>
				</div>
			</div>
			<div v-else class="product-not-found">
				<p>Product not found</p>
				<router-link to="/shop">Continue Shopping</router-link>
			</div>
			<RelatedProducts v-if="product" :product-id="product.id" />
		</main>
	</div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'
import { usePhotoSwipe } from '../composables/usePhotoSwipe'
import RelatedProducts from '../components/RelatedProducts.vue'

export default {
	name: 'Product',
	components: {
		RelatedProducts
	},
	props: {
		slug: {
			type: String,
			required: true
		}
	},
	setup(props) {
		const route = useRoute()
		const { loadProducts, getProductBySlug } = useProducts()
		const { addItem, formatPrice } = useCart()
		const product = ref(null)
		const quantity = ref(1)
		const imageDimensions = ref([])
		const selectedImageIndex = ref(0)

		// Load image dimensions
		const loadImageDimensions = async (images) => {
			if (!images || images.length === 0) return

			const dimensions = await Promise.all(
				images.map((imageSrc) => {
					return new Promise((resolve) => {
						const img = new Image()
						img.onload = () => {
							resolve({ width: img.naturalWidth, height: img.naturalHeight })
						}
						img.onerror = () => {
							// Default dimensions if image fails to load
							resolve({ width: 1200, height: 1200 })
						}
						img.src = imageSrc
					})
				})
			)
			imageDimensions.value = dimensions
		}

		const formatDescription = (text) => {
			if (!text) return ''
			return text.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>')
		}

		const addToCart = () => {
			if (product.value && product.value.in_stock) {
				addItem(product.value, quantity.value)
				alert('Product added to cart!')
			}
		}

		// Initialize PhotoSwipe
		const { initPhotoSwipe, openAtIndex } = usePhotoSwipe('#product-gallery')

		const openPhotoSwipe = (index) => {
			openAtIndex(index)
		}

		const initializeGallery = async () => {
			if (product.value && product.value.images && product.value.images.length > 0) {
				await loadImageDimensions(product.value.images)
				await nextTick()
				// Wait a bit for DOM to be ready
				setTimeout(() => {
					initPhotoSwipe()
				}, 300)
			}
		}

		onMounted(async () => {
			await loadProducts()
			const slug = props.slug || route.params.slug
			product.value = getProductBySlug(slug)
			selectedImageIndex.value = 0
			await initializeGallery()
		})

		// Watch for product changes
		watch(() => product.value, async () => {
			selectedImageIndex.value = 0
			await initializeGallery()
		})

		return {
			product,
			quantity,
			imageDimensions,
			selectedImageIndex,
			openPhotoSwipe,
			addToCart,
			formatPrice,
			formatDescription
		}
	}
}
</script>
