<template>
  <div class="content-area primary">
    <main class="site-main main" role="main">
      <div class="shop-front">
        <div class="category-links">
          <router-link 
            v-for="category in categories" 
            :key="category.slug"
            :to="`/shop?category=${category.slug}`"
          >
            <div 
              class="category-link" 
              :style="{ backgroundImage: `url(${getCategoryImage(category)})` }"
            >
              <div class="overlay"></div>
              <h2>{{ category.name }}</h2>
            </div>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useProducts } from '../composables/useProducts'

export default {
  name: 'Home',
  setup() {
    const { loadProducts, getAllCategories, getProductsByCategory } = useProducts()
    const categories = ref([])
    const products = ref([])

    const getCategoryImage = (category) => {
      if (category.slug === 'earring' || category.slug === 'earrings') {
        return '/assets/images/products/2018/11/F1D6D71F-F6F2-46F5-8899-B0157168B77B-scaled.jpeg'
      }
      if (category.slug === 'necklace' || category.slug === 'necklaces') {
        return '/assets/images/products/2018/11/EA44B98A-5A37-497A-AA66-CFFEF783E398-scaled.jpeg'
      }
      if (category.slug === 'hairpin' || category.slug === 'hairpins') {
        return '/assets/images/products/2018/07/DSC_5052-scaled.jpg'
      }
      if (category.slug === 'money-clip' || category.slug === 'money-clips') {
        return '/assets/images/products/2018/07/DSC_4984-scaled.jpg'
      }
      const categoryProducts = getProductsByCategory(category.slug)
      if (categoryProducts.length > 0 && categoryProducts[0].images && categoryProducts[0].images.length > 0) {
        return categoryProducts[0].images[0]
      }
      return '/assets/images/all-jewelry.jpg'
    }

    onMounted(async () => {
      await loadProducts()
      products.value = await loadProducts()
      categories.value = getAllCategories()
      console.log('[Home] Categories loaded:', categories.value)
    })

    return {
      categories,
      getCategoryImage
    }
  }
}
</script>

