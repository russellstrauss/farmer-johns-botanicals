<template>
  <div id="primary" class="content-area woocommerce woocommerce-shop">
    <main id="main" class="site-main" role="main">
      <div class="above-shop-section">
        <ul class="product-categories" id="product-categories">
          <li v-for="category in categories" :key="category.slug">
            <router-link :to="`/shop?category=${category.slug}`">{{ category.name }}</router-link>
          </li>
        </ul>
      </div>
      <ul class="products" id="products-list">
          <li v-for="product in filteredProducts" :key="product.id" class="product">
            <router-link :to="`/product/${product.slug}`">
              <div class="product-image-wrapper" :style="{ backgroundImage: `url(${getProductImage(product)})` }">
                <img :src="getProductImage(product)" :alt="product.name" />
              </div>
              <span v-if="product.sale_price" class="sale-badge">Sale</span>
              <h3 class="woocommerce-loop-product__title">{{ product.name }}</h3>
              <span class="price">
                <span class="amount">
                  <span v-if="product.sale_price" class="sale-price">{{ formatPrice(product.sale_price) }}</span>
                  <span :class="{ 'regular-price': product.sale_price }">{{ formatPrice(product.price) }}</span>
                </span>
              </span>
            </router-link>
          </li>
        </ul>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'

export default {
  name: 'Shop',
  setup() {
    const route = useRoute()
    const { loadProducts, getProductsByCategory, getProductsByTag, getAllCategories } = useProducts()
    const { addItem, formatPrice } = useCart()
    const products = ref([])
    const categories = ref([])

    const filteredProducts = computed(() => {
      const tagFilter = route.query.tag
      const categoryFilter = route.query.category

      if (tagFilter) {
        return getProductsByTag(tagFilter)
      } else if (categoryFilter) {
        return getProductsByCategory(categoryFilter)
      }
      // Return all products (with $1 item already at the top from useProducts)
      return products.value
    })

    const getProductImage = (product) => {
      return product.images && product.images.length > 0 
        ? product.images[0] 
        : '/assets/images/placeholder.jpg'
    }

    const addToCart = (product) => {
      addItem(product, 1)
      alert('Product added to cart!')
    }

    onMounted(async () => {
      products.value = await loadProducts()
      categories.value = getAllCategories()
    })

    return {
      products,
      categories,
      filteredProducts,
      getProductImage,
      addToCart,
      formatPrice
    }
  }
}
</script>

