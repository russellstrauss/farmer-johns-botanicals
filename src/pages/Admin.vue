<template>
  <div id="primary" class="content-area admin-area">
    <main id="main" class="site-main" role="main">
      <div class="admin-header">
        <h1>Content Management</h1>
        <div class="admin-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="{ active: activeTab === tab.id }"
            class="tab-button"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Products Tab -->
      <div v-if="activeTab === 'products'" class="admin-content">
        <div class="admin-actions">
          <button @click="showAddProduct = true" class="button">Add New Product</button>
          <button @click="saveProducts" class="button primary">Save Changes</button>
        </div>
        <div class="products-list">
          <div v-for="product in products" :key="product.id" class="product-item">
            <img 
              :src="getProductImage(product)" 
              :alt="product.name" 
              class="product-thumb"
            />
            <div class="product-details">
              <h3>{{ product.name }}</h3>
              <p>{{ formatPrice(product.price) }}</p>
            </div>
            <div class="product-actions">
              <button @click="editProduct(product)" class="button small">Edit</button>
              <button @click="deleteProduct(product.id)" class="button small danger">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pages Tab -->
      <div v-if="activeTab === 'pages'" class="admin-content">
        <div class="admin-actions">
          <button @click="showAddPage = true" class="button">Add New Page</button>
          <button @click="savePages" class="button primary">Save Changes</button>
        </div>
        <div class="pages-list">
          <div v-for="page in pages" :key="page.slug" class="page-item">
            <h3>{{ page.title }}</h3>
            <p>Slug: {{ page.slug }}</p>
            <div class="page-actions">
              <button @click="editPage(page)" class="button small">Edit</button>
              <button @click="deletePage(page.slug)" class="button small danger">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Editor Modal -->
      <div v-if="showAddProduct || editingProduct" class="modal" @click.self="closeProductEditor">
        <div class="modal-content">
          <h2>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
          <form @submit.prevent="saveProduct">
            <div class="form-group">
              <label>Name</label>
              <input v-model="productForm.name" required />
            </div>
            <div class="form-group">
              <label>Slug</label>
              <input v-model="productForm.slug" required />
            </div>
            <div class="form-group">
              <label>SKU</label>
              <input v-model="productForm.sku" required />
            </div>
            <div class="form-group">
              <label>Price</label>
              <input type="number" v-model.number="productForm.price" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Sale Price (optional)</label>
              <input type="number" v-model.number="productForm.sale_price" step="0.01" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="productForm.short_description" rows="4"></textarea>
            </div>
            <div class="form-group">
              <label>Images (one per line)</label>
              <textarea v-model="productForm.imagesText" rows="4" placeholder="/assets/images/product1.jpg"></textarea>
            </div>
            <div class="form-group">
              <label>Stock Quantity</label>
              <input type="number" v-model.number="productForm.stock_quantity" min="0" />
            </div>
            <div class="form-actions">
              <button type="submit" class="button primary">Save</button>
              <button type="button" @click="closeProductEditor" class="button">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Page Editor Modal -->
      <div v-if="showAddPage || editingPage" class="modal" @click.self="closePageEditor">
        <div class="modal-content">
          <h2>{{ editingPage ? 'Edit Page' : 'Add New Page' }}</h2>
          <form @submit.prevent="savePage">
            <div class="form-group">
              <label>Title</label>
              <input v-model="pageForm.title" required />
            </div>
            <div class="form-group">
              <label>Slug</label>
              <input v-model="pageForm.slug" required />
            </div>
            <div class="form-group">
              <label>Content</label>
              <textarea v-model="pageForm.content" rows="10"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="button primary">Save</button>
              <button type="button" @click="closePageEditor" class="button">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'

export default {
  name: 'Admin',
  setup() {
    const { loadProducts, products: productsData } = useProducts()
    const { formatPrice } = useCart()
    const activeTab = ref('products')
    const showAddProduct = ref(false)
    const showAddPage = ref(false)
    const editingProduct = ref(null)
    const editingPage = ref(null)
    const products = ref([])
    const pages = ref([])

    const tabs = [
      { id: 'products', label: 'Products' },
      { id: 'pages', label: 'Pages' }
    ]

    const productForm = ref({
      id: null,
      name: '',
      slug: '',
      sku: '',
      price: 0,
      sale_price: null,
      short_description: '',
      imagesText: '',
      stock_quantity: 1,
      categories: [],
      tags: []
    })

    const pageForm = ref({
      title: '',
      slug: '',
      content: ''
    })

    const getProductImage = (product) => {
      return product.images && product.images.length > 0 
        ? product.images[0] 
        : '/assets/images/placeholder.jpg'
    }

    const loadPages = async () => {
      try {
        const response = await fetch('/data/pages.json')
        if (response.ok) {
          pages.value = await response.json()
        } else {
          pages.value = []
        }
      } catch (error) {
        console.error('Error loading pages:', error)
        pages.value = []
      }
    }

    const editProduct = (product) => {
      editingProduct.value = product
      productForm.value = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        sale_price: product.sale_price,
        short_description: product.short_description || '',
        imagesText: product.images ? product.images.join('\n') : '',
        stock_quantity: product.stock_quantity || 1,
        categories: product.categories || [],
        tags: product.tags || []
      }
    }

    const editPage = (page) => {
      editingPage.value = page
      pageForm.value = {
        title: page.title,
        slug: page.slug,
        content: page.content || ''
      }
    }

    const saveProduct = () => {
      const images = productForm.value.imagesText.split('\n').filter(url => url.trim())
      
      if (editingProduct.value) {
        const index = products.value.findIndex(p => p.id === editingProduct.value.id)
        if (index > -1) {
          products.value[index] = {
            ...products.value[index],
            ...productForm.value,
            images: images,
            regular_price: productForm.value.price,
            stock_status: productForm.value.stock_quantity > 0 ? 'instock' : 'outofstock',
            in_stock: productForm.value.stock_quantity > 0,
            manage_stock: true
          }
        }
      } else {
        const newId = Math.max(...products.value.map(p => p.id), 0) + 1
        products.value.push({
          id: newId,
          name: productForm.value.name,
          slug: productForm.value.slug,
          sku: productForm.value.sku,
          price: productForm.value.price,
          regular_price: productForm.value.price,
          sale_price: productForm.value.sale_price,
          short_description: productForm.value.short_description,
          images: images,
          stock_quantity: productForm.value.stock_quantity,
          stock_status: productForm.value.stock_quantity > 0 ? 'instock' : 'outofstock',
          in_stock: productForm.value.stock_quantity > 0,
          manage_stock: true,
          categories: [],
          tags: [],
          currency: 'USD',
          type: 'simple',
          featured: false
        })
      }
      closeProductEditor()
    }

    const savePage = () => {
      if (editingPage.value) {
        const index = pages.value.findIndex(p => p.slug === editingPage.value.slug)
        if (index > -1) {
          pages.value[index] = {
            ...pages.value[index],
            ...pageForm.value
          }
        }
      } else {
        pages.value.push({
          title: pageForm.value.title,
          slug: pageForm.value.slug,
          content: pageForm.value.content
        })
      }
      closePageEditor()
    }

    const deleteProduct = (id) => {
      if (confirm('Are you sure you want to delete this product?')) {
        products.value = products.value.filter(p => p.id !== id)
      }
    }

    const deletePage = (slug) => {
      if (confirm('Are you sure you want to delete this page?')) {
        pages.value = pages.value.filter(p => p.slug !== slug)
      }
    }

    const closeProductEditor = () => {
      showAddProduct.value = false
      editingProduct.value = null
      productForm.value = {
        id: null,
        name: '',
        slug: '',
        sku: '',
        price: 0,
        sale_price: null,
        short_description: '',
        imagesText: '',
        stock_quantity: 1,
        categories: [],
        tags: []
      }
    }

    const closePageEditor = () => {
      showAddPage.value = false
      editingPage.value = null
      pageForm.value = {
        title: '',
        slug: '',
        content: ''
      }
    }

    const saveProducts = async () => {
      try {
        const dataStr = JSON.stringify(products.value, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'products.json'
        a.click()
        URL.revokeObjectURL(url)
        alert('Products saved! Download the file and place it in /public/data/products.json')
      } catch (error) {
        console.error('Error saving products:', error)
        alert('Error saving products')
      }
    }

    const savePages = async () => {
      try {
        const dataStr = JSON.stringify(pages.value, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'pages.json'
        a.click()
        URL.revokeObjectURL(url)
        alert('Pages saved! Download the file and place it in /public/data/pages.json')
      } catch (error) {
        console.error('Error saving pages:', error)
        alert('Error saving pages')
      }
    }

    onMounted(async () => {
      await loadProducts()
      products.value = [...productsData.value]
      await loadPages()
    })

    return {
      activeTab,
      tabs,
      products,
      pages,
      showAddProduct,
      showAddPage,
      editingProduct,
      editingPage,
      productForm,
      pageForm,
      getProductImage,
      formatPrice,
      editProduct,
      editPage,
      saveProduct,
      savePage,
      deleteProduct,
      deletePage,
      closeProductEditor,
      closePageEditor,
      saveProducts,
      savePages
    }
  }
}
</script>

<style scoped>
.admin-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.tab-button.active {
  background: #333;
  color: white;
}

.admin-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.products-list, .pages-list {
  display: grid;
  gap: 1rem;
}

.product-item, .page-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.product-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.product-actions, .page-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.button.primary {
  background: #333;
  color: white;
  border-color: #333;
}

.button.danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>


