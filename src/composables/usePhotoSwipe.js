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
    const children = galleryElement.querySelectorAll('a')
    if (children.length === 0) {
      console.warn(`PhotoSwipe: No gallery items found in "${gallerySelector}"`)
      return
    }

    try {
      lightbox.value = new PhotoSwipeLightbox({
        gallery: gallerySelector,
        children: 'a',
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

  return {
    lightbox,
    initPhotoSwipe,
    destroyPhotoSwipe
  }
}

