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

      const visibleProducts = products.value.filter(product => !product.hidden_from_shop && !product.custom_amount)

      if (tagFilter) {
        return getProductsByTag(tagFilter).filter(product => !product.hidden_from_shop && !product.custom_amount)
      } else if (categoryFilter) {
        return getProductsByCategory(categoryFilter).filter(product => !product.hidden_from_shop && !product.custom_amount)
      }
      // Return all visible products
      return visibleProducts
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

