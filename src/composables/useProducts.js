import { ref, computed } from 'vue'

let products = ref([])
let loaded = false

export function useProducts() {
  const loadProducts = async () => {
    if (loaded) return products.value
    
    try {
      const response = await fetch('/data/products.json')
      const loadedProducts = await response.json()
      
      // Add $1 item at the top
      const dollarItem = {
        id: 'dollar-item',
        name: 'Special $1 Item',
        slug: 'special-dollar-item',
        sku: 'DOLLAR-ITEM',
        description: '',
        short_description: 'A special promotional item for just $1!',
        price: 1,
        regular_price: 1,
        sale_price: null,
        currency: 'USD',
        images: ['/assets/images/products/woocommerce-placeholder.webp'],
        categories: [],
        tags: [],
        attributes: [],
        stock_status: 'instock',
        stock_quantity: 999,
        manage_stock: true,
        in_stock: true,
        weight: null,
        dimensions: {
          length: null,
          width: null,
          height: null
        },
        featured: false,
        type: 'simple',
        date_created: new Date().toISOString(),
        date_modified: new Date().toISOString()
      }
      
      products.value = [dollarItem, ...loadedProducts]
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
      p.categories.some(cat => cat.slug === categorySlug)
    )
  }

  const getProductsByTag = (tagSlug) => {
    return products.value.filter(p => 
      p.tags.some(tag => tag.slug === tagSlug)
    )
  }

  const getAllCategories = () => {
    const categoriesMap = new Map()
    products.value.forEach(product => {
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

    // Get category slugs from current product
    const categorySlugs = currentProduct.categories.map(cat => cat.slug)

    // Find products in the same categories, excluding the current product
    const related = products.value.filter(product => {
      if (product.id === productId) return false
      return product.categories && product.categories.some(cat => categorySlugs.includes(cat.slug))
    })

    // Limit the number of related products
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

