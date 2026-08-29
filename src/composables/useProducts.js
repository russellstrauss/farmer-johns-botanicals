import { ref, computed } from 'vue'

let products = ref([])
let loaded = false

export function useProducts() {
  const loadProducts = async () => {
    if (loaded) return products.value
    
    try {
      const response = await fetch('/data/products.json')
      const loadedProducts = await response.json()
      
      products.value = loadedProducts.filter(product => !product.hidden_from_shop && !product.custom_amount)
      loaded = true
      return products.value
    } catch (error) {
      console.error('Error loading products:', error)
      return []
    }
  }

  const getProductBySlug = (slug) => {
    return products.value.find(p => p.slug === slug)
  }

  const getProductById = (id) => {
    return products.value.find(p => p.id === id)
  }

  const getProductsByCategory = (categorySlug) => {
    return products.value.filter(p => 
      p.categories && p.categories.some(cat => cat.slug === categorySlug)
    )
  }

  const getProductsByTag = (tagSlug) => {
    return products.value.filter(p => 
      p.tags && p.tags.some(tag => tag.slug === tagSlug)
    )
  }

  const getAllCategories = () => {
    const categoriesMap = new Map()
    products.value.forEach(product => {
      if (!product.categories) return
      product.categories.forEach(cat => {
        if (!categoriesMap.has(cat.slug)) {
          categoriesMap.set(cat.slug, cat)
        }
      })
    })
    return Array.from(categoriesMap.values())
  }

  const getAllTags = () => {
    const tagsMap = new Map()
    products.value.forEach(product => {
      product.tags.forEach(tag => {
        if (!tagsMap.has(tag.slug)) {
          tagsMap.set(tag.slug, tag)
        }
      })
    })
    return Array.from(tagsMap.values())
  }

  const getRelatedProducts = (productId, limit = 4) => {
    const currentProduct = getProductById(productId)
    if (!currentProduct || !currentProduct.categories || currentProduct.categories.length === 0) {
      return []
    }

    const categorySlugs = currentProduct.categories.map(cat => cat.slug)

    const related = products.value.filter(product => {
      if (product.id === productId) return false
      return product.categories && product.categories.some(cat => categorySlugs.includes(cat.slug))
    })

    return related.slice(0, limit)
  }

  return {
    products: computed(() => products.value),
    loadProducts,
    getProductBySlug,
    getProductById,
    getProductsByCategory,
    getProductsByTag,
    getAllCategories,
    getAllTags,
    getRelatedProducts
  }
}

