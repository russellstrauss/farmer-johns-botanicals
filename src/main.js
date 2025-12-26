import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './routes'

// Import SASS - Vite will process this
import './assets/sass/style.scss'

// Import PhotoSwipe CSS
import 'photoswipe/style.css'

// Diagnostic logging
console.log('[Main] Starting Vue app initialization...')
console.log('[Main] Routes loaded:', routes)
console.log('[Main] App component:', App)

try {
  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  // Add router error handling
  router.onError((error) => {
    console.error('[Router] Navigation error:', error)
  })

  // Log router ready state
  router.beforeEach((to, from, next) => {
    console.log('[Router] Navigating from', from.path, 'to', to.path)
    next()
  })

  router.afterEach((to, from) => {
    console.log('[Router] Navigation complete to', to.path)
    console.log('[Router] Matched route:', to.matched)
  })

  console.log('[Main] Router created successfully')

  const app = createApp(App)
  console.log('[Main] Vue app created')
  
  app.use(router)
  console.log('[Main] Router registered with app')

  // Check if mount target exists
  const mountTarget = document.querySelector('#app')
  if (!mountTarget) {
    console.error('[Main] ERROR: #app element not found in DOM!')
    throw new Error('#app element not found')
  }
  console.log('[Main] Mount target found:', mountTarget)

  app.mount('#app')
  console.log('[Main] App mounted successfully')

  // Add woocommerce class to body for styling
  document.body.classList.add('woocommerce')
  console.log('[Main] Initialization complete')
} catch (error) {
  console.error('[Main] ERROR during app initialization:', error)
  // Display error in the DOM if app fails to mount
  const appElement = document.querySelector('#app')
  if (appElement) {
    appElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h1>Application Error</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Stack:</strong></p>
        <pre>${error.stack}</pre>
        <p>Please check the browser console for more details.</p>
      </div>
    `
  }
}

