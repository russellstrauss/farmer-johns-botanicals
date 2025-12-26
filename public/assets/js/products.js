/**
 * Product Management
 * Handles product data loading and display
 */

class ProductManager {
    constructor() {
        this.products = [];
        this.productsUrl = '/data/products.json';
    }

    /**
     * Load products from JSON file
     * @returns {Promise<Array>} Promise that resolves with products array
     */
    async loadProducts() {
        try {
            const response = await fetch(this.productsUrl);
            if (!response.ok) {
                throw new Error(`Failed to load products: ${response.statusText}`);
            }
            this.products = await response.json();
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    /**
     * Get product by slug
     * @param {string} slug - Product slug
     * @returns {Object|null} Product object or null
     */
    getProductBySlug(slug) {
        return this.products.find(p => p.slug === slug) || null;
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Object|null} Product object or null
     */
    getProductById(id) {
        return this.products.find(p => p.id === parseInt(id)) || null;
    }

    /**
     * Get products by category
     * @param {string} categorySlug - Category slug
     * @returns {Array} Array of products
     */
    getProductsByCategory(categorySlug) {
        return this.products.filter(p => 
            p.categories.some(cat => cat.slug === categorySlug)
        );
    }

    /**
     * Get products by tag
     * @param {string} tagSlug - Tag slug
     * @returns {Array} Array of products
     */
    getProductsByTag(tagSlug) {
        return this.products.filter(p => 
            p.tags.some(tag => tag.slug === tagSlug)
        );
    }

    /**
     * Get all categories
     * @returns {Array} Array of unique categories
     */
    getAllCategories() {
        const categoriesMap = new Map();
        this.products.forEach(product => {
            product.categories.forEach(cat => {
                if (!categoriesMap.has(cat.slug)) {
                    categoriesMap.set(cat.slug, cat);
                }
            });
        });
        return Array.from(categoriesMap.values());
    }

    /**
     * Get all tags
     * @returns {Array} Array of unique tags
     */
    getAllTags() {
        const tagsMap = new Map();
        this.products.forEach(product => {
            product.tags.forEach(tag => {
                if (!tagsMap.has(tag.slug)) {
                    tagsMap.set(tag.slug, tag);
                }
            });
        });
        return Array.from(tagsMap.values());
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Array} Array of matching products
     */
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery) ||
            product.short_description.toLowerCase().includes(lowerQuery) ||
            product.sku.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Format price for display
     * @param {number} price - Price in dollars
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    /**
     * Check if product is in stock
     * @param {Object} product - Product object
     * @returns {boolean} True if in stock
     */
    isInStock(product) {
        if (product.manage_stock) {
            return product.stock_quantity > 0;
        }
        return product.in_stock;
    }
}

// Initialize global product manager
const productManager = new ProductManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
}

