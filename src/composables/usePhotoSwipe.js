import { onUnmounted, ref } from 'vue'
import PhotoSwipeLightbox from 'photoswipe/lightbox'

export function usePhotoSwipe(gallerySelector, options = {}) {
  const lightbox = ref(null)

  const initPhotoSwipe = () => {
    // Destroy existing instance if any
    if (lightbox.value) {
      try {
        lightbox.value.destroy()
      } catch (e) {
        // Ignore errors during cleanup
      }
      lightbox.value = null
    }

    // Check if gallery element exists
    const galleryElement = document.querySelector(gallerySelector)
    if (!galleryElement) {
      console.warn(`PhotoSwipe: Gallery element "${gallerySelector}" not found`)
      return
    }

    // Check if gallery has children
    const children = galleryElement.querySelectorAll('a.pswp-gallery-item')
    if (children.length === 0) {
      console.warn(`PhotoSwipe: No gallery items found in "${gallerySelector}"`)
      return
    }

    try {
      lightbox.value = new PhotoSwipeLightbox({
        gallery: gallerySelector,
        children: 'a.pswp-gallery-item',
        pswpModule: () => import('photoswipe'),
        ...options
      })

      lightbox.value.init()
    } catch (error) {
      console.error('PhotoSwipe initialization error:', error)
    }
  }

  const destroyPhotoSwipe = () => {
    if (lightbox.value) {
      try {
        lightbox.value.destroy()
      } catch (e) {
        // Ignore errors during cleanup
      }
      lightbox.value = null
    }
  }

  onUnmounted(() => {
    destroyPhotoSwipe()
  })

  const openAtIndex = (index) => {
    if (!lightbox.value) {
      console.warn('PhotoSwipe not initialized')
      return
    }
    
    const galleryElement = document.querySelector(gallerySelector)
    if (!galleryElement) {
      console.warn(`Gallery element "${gallerySelector}" not found`)
      return
    }
    
    const links = galleryElement.querySelectorAll('a.pswp-gallery-item')
    if (!links[index]) {
      console.warn(`Gallery link at index ${index} not found`)
      return
    }
    
    // Create and dispatch a click event on the link
    // This will trigger PhotoSwipe to open at the correct index
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    links[index].dispatchEvent(clickEvent)
  }

  return {
    lightbox,
    initPhotoSwipe,
    destroyPhotoSwipe,
    openAtIndex
  }
}
