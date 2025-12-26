import { createApp } from 'vue'
import ProductGallery from './components/ProductGallery.vue'

/**
 * Initialize Vue Product Gallery on WordPress product pages
 */
function initProductGallery() {
  console.log('ProductGallery: Initializing...')
  // Find all gallery containers
  const galleryContainers = document.querySelectorAll('.vue-product-gallery-container')
  console.log('ProductGallery: Found containers:', galleryContainers.length)
  
  if (galleryContainers.length === 0) {
    console.warn('ProductGallery: No gallery containers found')
    return
  }
  
  galleryContainers.forEach((container, index) => {
    console.log(`ProductGallery: Processing container ${index + 1}`)
    // Get image data from data attribute
    const imagesData = container.getAttribute('data-images')
    
    if (!imagesData) {
      console.warn('ProductGallery: No image data found')
      return
    }
    
    let images = []
    try {
      images = JSON.parse(imagesData)
    } catch (e) {
      console.error('ProductGallery: Failed to parse image data', e)
      return
    }
    
    // Normalize image data
    const normalizedImages = images.map(img => ({
      id: img.id || 0,
      full: img.full || img.src || img.url || '',
      thumbnail: img.thumbnail || img.thumb || img.full || img.src || img.url || '',
      alt: img.alt || img.name || '',
      name: img.name || ''
    }))
    
    // Create Vue app instance
    try {
      console.log('ProductGallery: Creating Vue app with', normalizedImages.length, 'images')
      const app = createApp(ProductGallery, {
        images: normalizedImages,
        enableZoom: container.getAttribute('data-enable-zoom') !== 'false',
        enableLightbox: container.getAttribute('data-enable-lightbox') !== 'false'
      })
      
      // Mount the component
      app.mount(container)
      console.log('ProductGallery: Successfully mounted on container', index + 1)
    } catch (error) {
      console.error('ProductGallery: Error mounting component:', error)
    }
  })
}

// Initialize when DOM is ready
console.log('ProductGallery: Script loaded, readyState:', document.readyState)
if (document.readyState === 'loading') {
  console.log('ProductGallery: Waiting for DOMContentLoaded')
  document.addEventListener('DOMContentLoaded', () => {
    console.log('ProductGallery: DOMContentLoaded fired')
    initProductGallery()
  })
} else {
  console.log('ProductGallery: DOM already ready, initializing immediately')
  // Use setTimeout to ensure DOM is fully ready
  setTimeout(initProductGallery, 100)
}

// Also initialize after AJAX content loads (for dynamic content)
if (typeof jQuery !== 'undefined') {
  jQuery(document).on('woocommerce_gallery_reset_slide_position', initProductGallery)
}

