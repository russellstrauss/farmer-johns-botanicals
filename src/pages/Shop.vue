<template>
  <div class="content-area primary">
    <main class="site-main main" role="main">
      <div class="above-shop-section">
        <ul class="product-categories">
          <li>
            <router-link to="/shop">All Dyes</router-link>
          </li>
          <li v-for="category in categories" :key="category.slug">
            <router-link :to="`/shop?category=${category.slug}`">{{ category.name }}</router-link>
          </li>
        </ul>
      </div>
      <ul class="products">
          <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
        </ul>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Shop',
  components: {
    ProductCard
  },
  setup() {
    const route = useRoute()
    const { loadProducts, getProductsByCategory, getProductsByTag, getAllCategories } = useProducts()
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

    onMounted(async () => {
      products.value = await loadProducts()
      categories.value = getAllCategories()
    })

    return {
      products,
      categories,
      filteredProducts
    }
  }
}
</script>

