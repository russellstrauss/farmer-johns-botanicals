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
        // Custom close button SVG without width/height attributes so it can be resized
        closeSVG: '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 32 32"><path d="M24 10l-2-2-6 6-6-6-2 2 6 6-6 6 2 2 6-6 6 6 2-2-6-6z" id="pswp__icn-close"/></svg>',
        // Custom arrow navigation SVGs without width/height attributes so they can be resized
        // PhotoSwipe's CSS will automatically flip the next arrow using transform: scale(-1, 1)
        arrowPrevSVG: '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 60 60"><path d="M29 43l-3 3-16-16 16-16 3 3-13 13 13 13z" id="pswp__icn-arrow"/></svg>',
        arrowNextSVG: '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 60 60"><path d="M29 43l-3 3-16-16 16-16 3 3-13 13 13 13z" id="pswp__icn-arrow"/></svg>',
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
