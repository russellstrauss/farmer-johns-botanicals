<template>
  <div class="vue-product-gallery" :class="{ 'gallery-loading': loading }">
    <!-- Main Image Display -->
    <div class="gallery-main" v-if="images.length > 0">
      <div class="main-image-wrapper" @mouseenter="enableZoom" @mouseleave="disableZoom" @mousemove="handleZoom">
        <img
          :src="currentImage.full"
          :alt="currentImage.alt || currentImage.name"
          class="main-image"
          :class="{ 'zoom-active': zoomEnabled }"
          ref="mainImage"
          @load="onImageLoad"
          @click="openLightbox"
        />
        <div
          v-if="zoomEnabled && zoomActive"
          class="zoom-lens"
          :style="zoomLensStyle"
        ></div>
        <div
          v-if="zoomEnabled && zoomActive"
          class="zoom-window"
          :style="zoomWindowStyle"
        >
          <img :src="currentImage.full" :alt="currentImage.alt" />
        </div>
      </div>
      
      <!-- Navigation Arrows -->
      <button
        v-if="images.length > 1"
        class="gallery-nav gallery-nav-prev"
        @click="previousImage"
        aria-label="Previous image"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button
        v-if="images.length > 1"
        class="gallery-nav gallery-nav-next"
        @click="nextImage"
        aria-label="Next image"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      
      <!-- Fullscreen/Lightbox Button -->
      <button
        class="gallery-fullscreen-btn"
        @click="openLightbox"
        aria-label="View fullscreen"
        v-if="images.length > 0"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </button>
    </div>
    
    <!-- Thumbnail Navigation -->
    <div class="gallery-thumbnails" v-if="images.length > 1">
      <button
        v-for="(image, index) in images"
        :key="image.id || index"
        class="thumbnail"
        :class="{ active: currentIndex === index }"
        @click="goToImage(index)"
        :aria-label="`View image ${index + 1}`"
      >
        <img :src="image.thumbnail || image.full" :alt="image.alt || image.name" />
      </button>
    </div>
    
    <!-- Lightbox Modal -->
    <div
      v-if="lightboxOpen"
      class="lightbox"
      @click="closeLightbox"
      @keydown.esc="closeLightbox"
      tabindex="0"
    >
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox" aria-label="Close lightbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <button
          v-if="images.length > 1"
          class="lightbox-nav lightbox-prev"
          @click.stop="previousImage"
          aria-label="Previous image"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <div class="lightbox-image-wrapper">
          <img
            :src="currentImage.full"
            :alt="currentImage.alt || currentImage.name"
            class="lightbox-image"
            @load="onLightboxImageLoad"
          />
        </div>
        
        <button
          v-if="images.length > 1"
          class="lightbox-nav lightbox-next"
          @click.stop="nextImage"
          aria-label="Next image"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        
        <div class="lightbox-info" v-if="images.length > 1">
          <span class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ProductGallery',
  props: {
    images: {
      type: Array,
      required: true,
      default: () => []
    },
    enableZoom: {
      type: Boolean,
      default: true
    },
    enableLightbox: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const currentIndex = ref(0)
    const zoomEnabled = ref(false)
    const zoomActive = ref(false)
    const lightboxOpen = ref(false)
    const loading = ref(true)
    const mainImage = ref(null)
    const mouseX = ref(0)
    const mouseY = ref(0)
    
    const currentImage = computed(() => {
      return props.images[currentIndex.value] || {}
    })
    
    const zoomLensStyle = computed(() => {
      if (!mainImage.value || !zoomActive.value) return {}
      const rect = mainImage.value.getBoundingClientRect()
      const lensSize = 150
      const x = Math.max(0, Math.min(mouseX.value - rect.left - lensSize / 2, rect.width - lensSize))
      const y = Math.max(0, Math.min(mouseY.value - rect.top - lensSize / 2, rect.height - lensSize))
      
      return {
        left: `${x}px`,
        top: `${y}px`,
        width: `${lensSize}px`,
        height: `${lensSize}px`
      }
    })
    
    const zoomWindowStyle = computed(() => {
      if (!mainImage.value || !zoomActive.value) return {}
      const rect = mainImage.value.getBoundingClientRect()
      const lensSize = 150
      const zoomFactor = 2.5
      const x = Math.max(0, Math.min(mouseX.value - rect.left - lensSize / 2, rect.width - lensSize))
      const y = Math.max(0, Math.min(mouseY.value - rect.top - lensSize / 2, rect.height - lensSize))
      
      return {
        backgroundImage: `url(${currentImage.value.full})`,
        backgroundSize: `${rect.width * zoomFactor}px ${rect.height * zoomFactor}px`,
        backgroundPosition: `-${x * zoomFactor}px -${y * zoomFactor}px`
      }
    })
    
    const enableZoomHandler = () => {
      if (props.enableZoom && props.images.length > 0) {
        zoomEnabled.value = true
      }
    }
    
    const disableZoom = () => {
      zoomEnabled.value = false
      zoomActive.value = false
    }
    
    const handleZoom = (e) => {
      if (!zoomEnabled.value) return
      zoomActive.value = true
      mouseX.value = e.clientX
      mouseY.value = e.clientY
    }
    
    const nextImage = () => {
      if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++
      } else {
        currentIndex.value = 0
      }
      disableZoom()
    }
    
    const previousImage = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
      } else {
        currentIndex.value = props.images.length - 1
      }
      disableZoom()
    }
    
    const goToImage = (index) => {
      currentIndex.value = index
      disableZoom()
    }
    
    const openLightbox = () => {
      if (props.enableLightbox) {
        lightboxOpen.value = true
        document.body.style.overflow = 'hidden'
      }
    }
    
    const closeLightbox = () => {
      lightboxOpen.value = false
      document.body.style.overflow = ''
    }
    
    const onImageLoad = () => {
      loading.value = false
    }
    
    const onLightboxImageLoad = () => {
      // Lightbox image loaded
    }
    
    const handleKeydown = (e) => {
      if (!lightboxOpen.value) return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        previousImage()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextImage()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        closeLightbox()
      }
    }
    
    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
      if (props.images.length > 0) {
        loading.value = false
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })
    
    return {
      currentIndex,
      currentImage,
      zoomEnabled,
      zoomActive,
      lightboxOpen,
      loading,
      mainImage,
      zoomLensStyle,
      zoomWindowStyle,
      enableZoom: enableZoomHandler,
      disableZoom,
      handleZoom,
      nextImage,
      previousImage,
      goToImage,
      openLightbox,
      closeLightbox,
      onImageLoad,
      onLightboxImageLoad
    }
  }
}
</script>

<style scoped>
.vue-product-gallery {
  position: relative;
  width: 100%;
}

.gallery-loading {
  opacity: 0.5;
}

.gallery-main {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Square aspect ratio */
  cursor: zoom-in;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.main-image.zoom-active {
  cursor: crosshair;
}

.zoom-lens {
  position: absolute;
  border: 2px solid #333;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 10;
}

.zoom-window {
  position: fixed;
  width: 400px;
  height: 400px;
  border: 2px solid #333;
  background: #fff;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: none;
}

.main-image.zoom-active ~ .zoom-window {
  display: block;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.gallery-nav:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.gallery-nav svg {
  width: 24px;
  height: 24px;
  color: #333;
}

.gallery-nav-prev {
  left: 1rem;
}

.gallery-nav-next {
  right: 1rem;
}

.gallery-fullscreen-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.gallery-fullscreen-btn:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.gallery-fullscreen-btn svg {
  width: 20px;
  height: 20px;
  color: #333;
}

.gallery-thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
}

.gallery-thumbnails::-webkit-scrollbar {
  height: 6px;
}

.gallery-thumbnails::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;
  transition: all 0.3s ease;
  padding: 0;
}

.thumbnail:hover {
  border-color: #999;
  transform: scale(1.05);
}

.thumbnail.active {
  border-color: #333;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Lightbox Styles */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.lightbox-image-wrapper {
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: transparent;
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  transition: opacity 0.3s ease;
}

.lightbox-close:hover {
  opacity: 0.7;
}

.lightbox-close svg {
  width: 24px;
  height: 24px;
  stroke: #fff;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  transition: all 0.3s ease;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-nav svg {
  width: 28px;
  height: 28px;
  stroke: #fff;
}

.lightbox-prev {
  left: -70px;
}

.lightbox-next {
  right: -70px;
}

.lightbox-info {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
}

.lightbox-counter {
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .gallery-nav {
    width: 36px;
    height: 36px;
  }
  
  .gallery-nav svg {
    width: 20px;
    height: 20px;
  }
  
  .gallery-nav-prev {
    left: 0.5rem;
  }
  
  .gallery-nav-next {
    right: 0.5rem;
  }
  
  .thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .lightbox-nav {
    width: 40px;
    height: 40px;
  }
  
  .lightbox-prev {
    left: 10px;
  }
  
  .lightbox-next {
    right: 10px;
  }
  
  .lightbox-close {
    top: 10px;
    right: 10px;
  }
  
  .zoom-window {
    display: none !important;
  }
}
</style>

