<template>
  <div id="primary" class="content-area woocommerce-shop">
    <main id="main" class="site-main" role="main">
      <div v-if="product">
        <div class="product">
          <div class="product-images">
            <div class="product-gallery">
              <img 
                v-for="(image, index) in product.images" 
                :key="index"
                :src="image" 
                :alt="`${product.name} ${index + 1}`" 
                :class="index === 0 ? 'main-image' : 'gallery-image'"
              />
            </div>
          </div>
          <div class="summary entry-summary">
            <h1>{{ product.name }}</h1>
            <div class="price">
              <span class="amount">
                <span v-if="product.sale_price" class="sale-price">{{ formatPrice(product.sale_price) }}</span>
                <span :class="{ 'regular-price': product.sale_price }">{{ formatPrice(product.price) }}</span>
              </span>
            </div>
            <div class="product-short-description" v-html="formatDescription(product.short_description)"></div>
            <div v-if="product.in_stock" class="stock in-stock">In Stock</div>
            <div v-else class="stock out-of-stock">Out of Stock</div>
            <div class="product-actions">
              <div class="quantity">
                <input 
                  type="number" 
                  id="quantity" 
                  class="qty"
                  v-model.number="quantity" 
                  min="1" 
                  :max="product.stock_quantity || 999"
                />
              </div>
              <button 
                class="button alt single_add_to_cart_button" 
                @click="addToCart"
                :disabled="!product.in_stock"
              >
                Add to Cart
              </button>
            </div>
            <div v-if="product.categories && product.categories.length > 0" class="product_meta">
              Categories: 
              <router-link 
                v-for="category in product.categories" 
                :key="category.slug"
                :to="`/shop?category=${category.slug}`"
              >
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
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'

export default {
  name: 'Product',
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

    onMounted(async () => {
      await loadProducts()
      const slug = props.slug || route.params.slug
      product.value = getProductBySlug(slug)
    })

    return {
      product,
      quantity,
      addToCart,
      formatPrice,
      formatDescription
    }
  }
}
</script>

