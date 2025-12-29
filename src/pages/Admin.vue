<template>
	<div class="content-area primary admin-area">
		<main class="site-main main" role="main">
			<div class="admin-header">
				<div class="admin-header-top">
					<h1>Content Management</h1>
					<button @click="handleLogout" class="button logout">Logout</button>
				</div>
				<div class="admin-tabs">
					<button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
						:class="{ active: activeTab === tab.id }" class="tab-button">
						{{ tab.label }}
					</button>
				</div>
			</div>

			<!-- Products Tab -->
			<div v-if="activeTab === 'products'" class="admin-content">
				<div class="admin-actions">
					<button @click="showAddProduct = true" class="button">Add New Product</button>
					<button @click="saveProducts" class="button primary" :class="{ 'unsaved': hasUnsavedProducts }">Save Changes</button>
				</div>
				<div class="products-list">
					<div v-for="(product, index) in products" :key="product.id" class="product-item">
						<div class="product-order-controls">
							<button @click="moveProductUp(index)" class="button-icon" :disabled="index === 0" title="Move up">
								↑
							</button>
							<button @click="moveProductDown(index)" class="button-icon" :disabled="index === products.length - 1" title="Move down">
								↓
							</button>
						</div>
						<img :src="getProductImage(product) || '/assets/images/placeholder.jpg'" :alt="product.name" class="product-thumb" />
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

			<!-- Categories Tab -->
			<div v-if="activeTab === 'categories'" class="admin-content">
				<div class="admin-actions">
					<button @click="showAddCategory = true" class="button">Add New Category</button>
					<button @click="saveCategories" class="button primary" :class="{ 'unsaved': hasUnsavedCategories }">Save Changes</button>
				</div>
				<div class="categories-list">
					<div v-for="category in categories" :key="category.slug" class="category-item">
						<div class="category-details">
							<h3>{{ category.name }}</h3>
							<p>Slug: {{ category.slug }}</p>
							<p v-if="category.description">{{ category.description }}</p>
						</div>
						<div class="category-actions">
							<button @click="editCategory(category)" class="button small">Edit</button>
							<button @click="deleteCategory(category.slug)" class="button small danger">Delete</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Pages Tab -->
			<div v-if="activeTab === 'pages'" class="admin-content">
				<div class="admin-actions">
					<button @click="showAddPage = true" class="button">Add New Page</button>
					<button @click="savePages" class="button primary" :class="{ 'unsaved': hasUnsavedPages }">Save Changes</button>
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
							<label>Images</label>
							<div class="image-upload-section">
								<input 
									type="file" 
									ref="fileInput" 
									@change="handleFileUpload" 
									accept="image/*" 
									multiple 
									style="display: none"
								/>
								<div class="upload-buttons">
									<button type="button" @click="triggerFileInput" class="button upload-button">
										Upload Images
									</button>
									<button type="button" @click="openImageBrowser" class="button browse-button">
										Browse Uploaded Images
									</button>
									<span v-if="uploading" class="upload-status">Uploading...</span>
								</div>
							</div>
							<div v-if="productImages.length > 0" class="images-list">
								<div v-for="(image, index) in productImages" :key="`${image}-${index}`" class="image-item">
									<div class="image-preview">
										<img :src="image" :alt="`Image ${index + 1}`" />
									</div>
									<div class="image-path">{{ image }}</div>
									<div class="image-actions">
										<button type="button" @click="moveImageUp(index)" class="button-icon" :disabled="index === 0" title="Move up">
											↑
										</button>
										<button type="button" @click="moveImageDown(index)" class="button-icon" :disabled="index === productImages.length - 1" title="Move down">
											↓
										</button>
										<button type="button" @click="removeImage(index)" class="button-icon danger" title="Remove">
											×
										</button>
									</div>
								</div>
							</div>
							<div v-else class="no-images-message">
								<p>No images added yet. Upload images or browse uploaded images to add them.</p>
							</div>
						</div>
						<div class="form-group">
							<label>Categories</label>
							<div class="categories-checkboxes">
								<label v-for="category in categories" :key="category.slug" class="category-checkbox">
									<input type="checkbox" :value="category" v-model="productForm.categories" />
									<span>{{ category.name }}</span>
								</label>
							</div>
							<p v-if="categories.length === 0" class="help-text">No categories available. Add categories in the Categories tab.</p>
						</div>
						<div class="form-group">
							<label>Available Sizes</label>
							<div class="sizes-checkboxes">
								<label v-for="size in availableSizes" :key="size" class="size-checkbox">
									<input type="checkbox" :value="size" v-model="productForm.sizes" />
									<span>{{ size }}</span>
								</label>
							</div>
						</div>
						<div class="form-group">
							<label>Colors (one per line or comma-separated)</label>
							<textarea v-model="productForm.colorsText" rows="3"
								placeholder="Blue&#10;Red&#10;Green"></textarea>
							<p class="help-text">Enter each color on a new line, or separate them with commas.</p>
						</div>
						<div class="form-actions">
							<button type="submit" class="button primary">Save</button>
							<button type="button" @click="closeProductEditor" class="button">Cancel</button>
						</div>
					</form>
				</div>
			</div>

			<!-- Category Editor Modal -->
			<div v-if="showAddCategory || editingCategory" class="modal" @click.self="closeCategoryEditor">
				<div class="modal-content">
					<h2>{{ editingCategory ? 'Edit Category' : 'Add New Category' }}</h2>
					<form @submit.prevent="saveCategory">
						<div class="form-group">
							<label>Name</label>
							<input v-model="categoryForm.name" required />
						</div>
						<div class="form-group">
							<label>Slug</label>
							<input v-model="categoryForm.slug" required />
						</div>
						<div class="form-group">
							<label>Description (optional)</label>
							<textarea v-model="categoryForm.description" rows="3"></textarea>
						</div>
						<div class="form-actions">
							<button type="submit" class="button primary">Save</button>
							<button type="button" @click="closeCategoryEditor" class="button">Cancel</button>
						</div>
					</form>
				</div>
			</div>

			<!-- Image Browser Modal -->
			<div v-if="showImageBrowser" class="modal" @click.self="closeImageBrowser">
				<div class="modal-content image-browser-modal">
					<h2>Select Uploaded Images</h2>
					<div v-if="uploadedImages.length === 0" class="no-images">
						<p>No uploaded images found. Upload some images first.</p>
					</div>
					<div v-else class="image-grid">
						<div 
							v-for="image in uploadedImages" 
							:key="image.path" 
							class="image-thumbnail"
							:class="{ selected: isImageSelected(image.path) }"
							@click="toggleImageSelection(image.path)"
						>
							<img :src="image.path" :alt="image.filename" />
							<div class="image-overlay">
								<span class="image-filename">{{ image.filename }}</span>
							</div>
						</div>
					</div>
					<div class="form-actions">
						<button type="button" @click="addSelectedImages" class="button primary">Add Selected Images</button>
						<button type="button" @click="closeImageBrowser" class="button">Cancel</button>
					</div>
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
import { useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'
import { useAuth } from '../composables/useAuth'

export default {
	name: 'Admin',
	setup() {
		const { loadProducts, products: productsData } = useProducts()
		const { formatPrice } = useCart()
		const { authToken, logout } = useAuth()
		const router = useRouter()
		const activeTab = ref('products')
		const showAddProduct = ref(false)
		const showAddPage = ref(false)
		const editingProduct = ref(null)
		const editingPage = ref(null)
		const products = ref([])
		const pages = ref([])
		const categories = ref([])
		const fileInput = ref(null)
		const uploading = ref(false)
		const showAddCategory = ref(false)
		const editingCategory = ref(null)
		const uploadedImages = ref([])
		const showImageBrowser = ref(false)
		
		// Store original state for comparison
		const originalProducts = ref([])
		const originalCategories = ref([])
		const originalPages = ref([])

		const tabs = [
			{ id: 'products', label: 'Products' },
			{ id: 'categories', label: 'Categories' },
			{ id: 'pages', label: 'Pages' }
		]

		const availableSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

		// Computed property to convert imagesText to array for easier manipulation
		const productImages = computed({
			get: () => {
				const imagesText = productForm.value.imagesText || ''
				return imagesText
					.split('\n')
					.map(url => url.trim())
					.filter(url => url && url.length > 0)
			},
			set: (newImages) => {
				productForm.value.imagesText = newImages.join('\n')
			}
		})

		const productForm = ref({
			id: null,
			name: '',
			slug: '',
			sku: '',
			price: 50,
			sale_price: null,
			short_description: '',
			imagesText: '',
			colorsText: '',
			categories: [],
			tags: [],
			sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] // All sizes checked by default
		})

		const pageForm = ref({
			title: '',
			slug: '',
			content: ''
		})

		const categoryForm = ref({
			name: '',
			slug: '',
			description: ''
		})

		const getProductImage = (product) => {
			// Ensure product has images array and it's not empty
			if (product && product.images && Array.isArray(product.images) && product.images.length > 0) {
				const firstImage = product.images[0]
				// Return the image path if it's a valid string
				return firstImage && typeof firstImage === 'string' && firstImage.trim()
					? firstImage.trim()
					: '/assets/images/placeholder.jpg'
			}
			return '/assets/images/placeholder.jpg'
		}

		const loadPages = async () => {
			try {
				const response = await fetch('/data/pages.json')
				if (response.ok) {
					const loadedPages = await response.json()
					pages.value = loadedPages
					// Store original state
					originalPages.value = JSON.parse(JSON.stringify(loadedPages))
				} else {
					pages.value = []
					originalPages.value = []
				}
			} catch (error) {
				console.error('Error loading pages:', error)
				pages.value = []
				originalPages.value = []
			}
		}

		const loadCategories = async () => {
			try {
				const response = await fetch('/data/categories.json')
				if (response.ok) {
					const loadedCategories = await response.json()
					categories.value = loadedCategories
					// Store original state
					originalCategories.value = JSON.parse(JSON.stringify(loadedCategories))
				} else {
					categories.value = []
					originalCategories.value = []
				}
			} catch (error) {
				console.error('Error loading categories:', error)
				categories.value = []
				originalCategories.value = []
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
				colorsText: product.colors ? product.colors.join('\n') : '',
				categories: product.categories ? product.categories.map(cat => {
					// Find the full category object from categories list
					if (typeof cat === 'string') {
						return categories.value.find(c => c.slug === cat) || { slug: cat, name: cat }
					}
					const slug = cat.slug || cat
					return categories.value.find(c => c.slug === slug) || cat
				}).filter(cat => cat) : [],
				tags: product.tags || [],
				sizes: product.sizes || []
			}
		}

		const editCategory = (category) => {
			editingCategory.value = category
			categoryForm.value = {
				name: category.name,
				slug: category.slug,
				description: category.description || ''
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
			// Parse images from textarea, ensuring we have a valid array
			const imagesText = productForm.value.imagesText || ''
			const images = imagesText
				.split('\n')
				.map(url => url.trim())
				.filter(url => url && url.length > 0)
			
			// Parse colors from textarea - support both newline and comma separation
			const colorsText = productForm.value.colorsText || ''
			const colors = colorsText
				.split(/[\n,]/)
				.map(color => color.trim())
				.filter(color => color && color.length > 0)
			
			console.log('Saving product with images:', images)
			console.log('Saving product with colors:', colors)

			if (editingProduct.value) {
				const index = products.value.findIndex(p => p.id === editingProduct.value.id)
				if (index > -1) {
					const updatedProduct = {
						...products.value[index],
						name: productForm.value.name,
						slug: productForm.value.slug,
						sku: productForm.value.sku,
						price: productForm.value.price,
						sale_price: productForm.value.sale_price,
						short_description: productForm.value.short_description,
						categories: productForm.value.categories ? productForm.value.categories.map(cat => ({
						name: cat.name || cat,
						slug: cat.slug || cat
					})) : [],
						tags: productForm.value.tags || [],
						sizes: productForm.value.sizes || [],
						colors: colors, // Set colors array
						images: images, // Set images explicitly
						regular_price: productForm.value.price
					}
					// Remove imagesText and colorsText if they exist (they shouldn't be in the product object)
					delete updatedProduct.imagesText
					delete updatedProduct.colorsText
					console.log('Updated product:', updatedProduct.name, 'Images:', updatedProduct.images)
					products.value[index] = updatedProduct
				}
			} else {
				// Generate new ID - find max numeric ID and add 1
				const numericIds = products.value
					.map(p => typeof p.id === 'number' ? p.id : 0)
					.filter(id => id > 0)
				const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1
				const newProduct = {
					id: newId,
					name: productForm.value.name,
					slug: productForm.value.slug,
					sku: productForm.value.sku,
					price: productForm.value.price,
					regular_price: productForm.value.price,
					sale_price: productForm.value.sale_price,
					short_description: productForm.value.short_description,
					images: images, // Ensure images array is always set
					colors: colors, // Set colors array
					categories: productForm.value.categories ? productForm.value.categories.map(cat => ({
						name: cat.name || cat,
						slug: cat.slug || cat
					})) : [],
					tags: [],
					sizes: productForm.value.sizes || [],
					currency: 'USD',
					type: 'simple',
					featured: false
				}
				console.log('New product created:', newProduct)
				products.value.push(newProduct)
			}
			closeProductEditor()
		}

		const saveCategory = () => {
			if (editingCategory.value) {
				const index = categories.value.findIndex(c => c.slug === editingCategory.value.slug)
				if (index > -1) {
					categories.value[index] = {
						...categories.value[index],
						...categoryForm.value
					}
				}
			} else {
				// Check if slug already exists
				const existingCategory = categories.value.find(c => c.slug === categoryForm.value.slug)
				if (existingCategory) {
					alert('A category with this slug already exists')
					return
				}
				categories.value.push({
					name: categoryForm.value.name,
					slug: categoryForm.value.slug,
					description: categoryForm.value.description || ''
				})
			}
			closeCategoryEditor()
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

		const deleteCategory = (slug) => {
			if (confirm('Are you sure you want to delete this category? Products using this category will keep it, but you won\'t be able to manage it.')) {
				categories.value = categories.value.filter(c => c.slug !== slug)
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
				price: 50,
				sale_price: null,
				short_description: '',
				imagesText: '',
				colorsText: '',
				categories: [],
				tags: [],
				sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] // All sizes checked by default
			}
		}

		const closeCategoryEditor = () => {
			showAddCategory.value = false
			editingCategory.value = null
			categoryForm.value = {
				name: '',
				slug: '',
				description: ''
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
				if (!authToken.value) {
					alert('You must be logged in to save products')
					return
				}

				const productsToSave = products.value

				const response = await fetch('/api/save-products', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${authToken.value}`
					},
					body: JSON.stringify({ products: productsToSave })
				})

				const result = await response.json()

				if (response.ok) {
					console.log('Products saved successfully:', result)
					alert(`Products saved successfully! (${result.count || productsToSave.length} products)`)
					// Reload products directly from the file to get fresh data
					// Use cache-busting query parameter to ensure we get the latest version
					try {
						const freshResponse = await fetch('/data/products.json?' + Date.now())
						if (freshResponse.ok) {
							const freshProducts = await freshResponse.json()
							products.value = freshProducts
							// Update original state after successful save
							originalProducts.value = JSON.parse(JSON.stringify(freshProducts))
						} else {
							// If fresh fetch fails, just reload using the composable
							await loadProducts()
							products.value = [...productsData.value]
							originalProducts.value = JSON.parse(JSON.stringify(productsData.value))
						}
					} catch (reloadError) {
						console.warn('Could not reload products, using composable:', reloadError)
						await loadProducts()
						products.value = [...productsData.value]
						originalProducts.value = JSON.parse(JSON.stringify(productsData.value))
					}
				} else {
					alert(`Error saving products: ${result.message || 'Unknown error'}`)
					console.error('Save products error:', result)
				}
			} catch (error) {
				console.error('Error saving products:', error)
				alert(`Error saving products: ${error.message}`)
			}
		}

		const saveCategories = async () => {
			try {
				if (!authToken.value) {
					alert('You must be logged in to save categories')
					return
				}

				const response = await fetch('/api/save-categories', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${authToken.value}`
					},
					body: JSON.stringify({ categories: categories.value })
				})

				const result = await response.json()

				if (response.ok) {
					alert('Categories saved successfully!')
					// Reload categories to get the latest data
					await loadCategories()
				} else {
					alert(`Error saving categories: ${result.message || 'Unknown error'}`)
				}
			} catch (error) {
				console.error('Error saving categories:', error)
				alert(`Error saving categories: ${error.message}`)
			}
		}

		const savePages = async () => {
			try {
				if (!authToken.value) {
					alert('You must be logged in to save pages')
					return
				}

				const response = await fetch('/api/save-pages', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${authToken.value}`
					},
					body: JSON.stringify({ pages: pages.value })
				})

				const result = await response.json()

				if (response.ok) {
					alert('Pages saved successfully!')
					// Reload pages to get the latest data
					await loadPages()
				} else {
					alert(`Error saving pages: ${result.message || 'Unknown error'}`)
				}
			} catch (error) {
				console.error('Error saving pages:', error)
				alert(`Error saving pages: ${error.message}`)
			}
		}

		const handleLogout = () => {
			if (confirm('Are you sure you want to logout?')) {
				logout()
				router.push('/login')
			}
		}

		const triggerFileInput = () => {
			fileInput.value?.click()
		}

		const handleFileUpload = async (event) => {
			const files = event.target.files
			if (!files || files.length === 0) return

			uploading.value = true
			try {
				for (const file of files) {
					const formData = new FormData()
					formData.append('image', file)

					const response = await fetch('/api/upload-image', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${authToken.value}`
						},
						body: formData
					})

					const result = await response.json()

					if (response.ok && result.success) {
						// Add the uploaded path(s) to images list
						const newPaths = result.paths || [result.path]
						const pathsToAdd = newPaths.map(p => p.trim()).filter(p => p)
						
						if (pathsToAdd.length > 0) {
							const currentImages = productImages.value
							productImages.value = [...currentImages, ...pathsToAdd]
							// Reload uploaded images list after successful upload
							await loadUploadedImages()
						}
					} else {
						// Handle duplicate file error (409) or other errors
						if (response.status === 409) {
							alert(`Upload blocked: ${result.message || 'File already exists'}`)
						} else {
							alert(`Error uploading ${file.name}: ${result.message || 'Unknown error'}`)
						}
					}
				}
			} catch (error) {
				console.error('Error uploading files:', error)
				alert(`Error uploading files: ${error.message}`)
			} finally {
				uploading.value = false
				// Reset file input
				if (fileInput.value) {
					fileInput.value.value = ''
				}
			}
		}

		const loadUploadedImages = async () => {
			try {
				if (!authToken.value) {
					return
				}

				const response = await fetch('/api/list-images', {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${authToken.value}`
					}
				})

				const result = await response.json()

				if (response.ok && result.success) {
					uploadedImages.value = result.images || []
				} else {
					console.error('Error loading images:', result.message)
					uploadedImages.value = []
				}
			} catch (error) {
				console.error('Error loading uploaded images:', error)
				uploadedImages.value = []
			}
		}

		const selectedImages = ref([])

		const openImageBrowser = async () => {
			await loadUploadedImages()
			showImageBrowser.value = true
		}

		const closeImageBrowser = () => {
			showImageBrowser.value = false
			selectedImages.value = []
		}

		const isImageSelected = (imagePath) => {
			return selectedImages.value.includes(imagePath)
		}

		const toggleImageSelection = (imagePath) => {
			const index = selectedImages.value.indexOf(imagePath)
			if (index > -1) {
				selectedImages.value.splice(index, 1)
			} else {
				selectedImages.value.push(imagePath)
			}
		}

		const addSelectedImages = () => {
			if (selectedImages.value.length === 0) {
				alert('Please select at least one image')
				return
			}

			// Add selected images to the current list
			const currentImages = productImages.value
			const newImages = [...currentImages, ...selectedImages.value]
			productImages.value = newImages
			
			selectedImages.value = []
			closeImageBrowser()
		}

		const moveImageUp = (index) => {
			if (index === 0) return
			const images = [...productImages.value]
			const temp = images[index]
			images[index] = images[index - 1]
			images[index - 1] = temp
			productImages.value = images
		}

		const moveImageDown = (index) => {
			const images = [...productImages.value]
			if (index === images.length - 1) return
			const temp = images[index]
			images[index] = images[index + 1]
			images[index + 1] = temp
			productImages.value = images
		}

		const removeImage = (index) => {
			const images = [...productImages.value]
			images.splice(index, 1)
			productImages.value = images
		}

		const moveProductUp = (index) => {
			if (index === 0) return
			const productsList = [...products.value]
			const temp = productsList[index]
			productsList[index] = productsList[index - 1]
			productsList[index - 1] = temp
			products.value = productsList
		}

		const moveProductDown = (index) => {
			const productsList = [...products.value]
			if (index === productsList.length - 1) return
			const temp = productsList[index]
			productsList[index] = productsList[index + 1]
			productsList[index + 1] = temp
			products.value = productsList
		}

		// Helper function to deep compare arrays
		const arraysEqual = (a, b) => {
			// If both are empty, consider them equal (initial state)
			if (a.length === 0 && b.length === 0) return true
			if (a.length !== b.length) return false
			return JSON.stringify(a) === JSON.stringify(b)
		}

		// Computed properties to check for unsaved changes
		const hasUnsavedProducts = computed(() => {
			// Only show as unsaved if both arrays have been initialized (not both empty)
			if (products.value.length === 0 && originalProducts.value.length === 0) return false
			return !arraysEqual(products.value, originalProducts.value)
		})

		const hasUnsavedCategories = computed(() => {
			// Only show as unsaved if both arrays have been initialized (not both empty)
			if (categories.value.length === 0 && originalCategories.value.length === 0) return false
			return !arraysEqual(categories.value, originalCategories.value)
		})

		const hasUnsavedPages = computed(() => {
			// Only show as unsaved if both arrays have been initialized (not both empty)
			if (pages.value.length === 0 && originalPages.value.length === 0) return false
			return !arraysEqual(pages.value, originalPages.value)
		})

		onMounted(async () => {
			await loadProducts()
			products.value = [...productsData.value]
			// Store original state immediately after setting products
			originalProducts.value = JSON.parse(JSON.stringify(productsData.value))
			await loadCategories()
			await loadPages()
		})

		return {
			activeTab,
			tabs,
			products,
			pages,
			categories,
			showAddProduct,
			showAddPage,
			showAddCategory,
			editingProduct,
			editingPage,
			editingCategory,
			productForm,
			pageForm,
			categoryForm,
			availableSizes,
			getProductImage,
			formatPrice,
			editProduct,
			editCategory,
			editPage,
			saveProduct,
			saveCategory,
			savePage,
			deleteProduct,
			deleteCategory,
			deletePage,
			closeProductEditor,
			closeCategoryEditor,
			closePageEditor,
			saveProducts,
			saveCategories,
			savePages,
			handleLogout,
			fileInput,
			uploading,
			triggerFileInput,
			handleFileUpload,
			showImageBrowser,
			uploadedImages,
			openImageBrowser,
			closeImageBrowser,
			isImageSelected,
			toggleImageSelection,
			addSelectedImages,
			productImages,
			moveImageUp,
			moveImageDown,
			removeImage,
			moveProductUp,
			moveProductDown,
			hasUnsavedProducts,
			hasUnsavedCategories,
			hasUnsavedPages
		}
	}
}
</script>

<style scoped lang="scss">
	@import '../assets/sass/_vars.scss';
	@import '../assets/sass/_mixins.scss';
	
	button {
		@include black-button;
	}
		
	.admin-area {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.admin-header {
		margin-bottom: 2rem;
	}

	.admin-header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.button.logout {
		background: #dc3545;
		color: white;
		border-color: #dc3545;
	}

	.admin-tabs {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.tab-button {
		@include black-button;
	}

	.tab-button.active {
		background: $accent-color;
		color: white;
	}

	.admin-actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.products-list, .pages-list, .categories-list {
		display: grid;
		gap: 1rem;
	}

	.product-item, .page-item, .category-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background-color: var(--bg-secondary);
	}

	.product-order-controls {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.product-thumb {
		width: 80px;
		height: 80px;
		object-fit: cover;
	}

	.product-actions, .page-actions, .category-actions {
		margin-left: auto;
		display: flex;
		gap: 0.5rem;
	}

	.category-details {
		flex: 1;
	}

	.categories-checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.category-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.category-checkbox input[type="checkbox"] {
		width: auto;
		margin: 0;
		cursor: pointer;
	}

	.help-text {
		margin-top: 0.5rem;
		font-style: italic;
		color: #666;
		font-size: 0.875rem;
	}

	.upload-buttons {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 0.5rem;
		
		button {
			@include black-button;
		}
	}

	.browse-button {
		background-color: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		padding: 0.5rem 1rem;

		&:hover {
			background-color: #218838;
		}
	}

	.image-browser-modal {
		max-width: 900px;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		max-height: 60vh;
		overflow-y: auto;
		margin: 1rem 0;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.image-thumbnail {
		position: relative;
		aspect-ratio: 1;
		border: 2px solid #ddd;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			border-color: #333;
			transform: scale(1.05);
		}

		&.selected {
			border-color: #007bff;
			border-width: 3px;
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.image-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.image-thumbnail:hover .image-overlay {
		opacity: 1;
	}

	.image-filename {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.no-images {
		text-align: center;
		padding: 2rem;
		color: #666;
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

	.form-group input, .form-group textarea {
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
		@include black-button;
	}

	.button.primary {
		background: #333;
		color: white;
		border-color: #333;
	}

	.button.primary.unsaved {
		background: #ff8c00;
		border-color: #ff8c00;
		color: white;

		&:hover {
			background: #ff7700;
			border-color: #ff7700;
		}
	}

	.button.danger {
		@include black-button;
		background: #dc3545;
		color: white;
		border-color: #dc3545;
	}

	.sizes-checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.images-list {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.image-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background-color: var(--bg-secondary);
	}

	.image-preview {
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f0f0;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.image-path {
		flex: 1;
		font-size: 0.9rem;
		color: var(--text-secondary);
		word-break: break-all;
	}

	.image-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.button-icon {
		width: 32px;
		height: 32px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		line-height: 1;
		cursor: pointer;
		background-color: var(--bg-primary);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		border-radius: 4px;
		transition: all 0.2s ease;

		&:hover:not(:disabled) {
			background-color: var(--bg-secondary);
			border-color: var(--text-primary);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&.danger {
			color: #dc3545;
			border-color: #dc3545;

			&:hover:not(:disabled) {
				background-color: #dc3545;
				color: white;
			}
		}
	}

	.no-images-message {
		margin-top: 1rem;
		padding: 1rem;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		color: var(--text-secondary);
		text-align: center;
	}

	.size-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.size-checkbox input[type="checkbox"] {
		width: auto;
		margin: 0;
		cursor: pointer;
	}

	.image-upload-section {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.upload-button {
		@include black-button;
		padding: 0.5rem 1rem;
		font-size: 14px;
	}

	.upload-status {
		color: #666;
		font-size: 14px;
		font-style: italic;
	}
</style>
