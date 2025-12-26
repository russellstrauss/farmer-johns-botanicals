import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './routes'

// Import PhotoSwipe CSS first (base styles)
import 'photoswipe/style.css'

// Import SASS after PhotoSwipe (so our custom styles can override PhotoSwipe defaults)
import './assets/sass/style.scss'

// Diagnostic logging
console.log('[Main] Starting Vue app initialization...')
console.log('[Main] Routes loaded:', routes)
console.log('[Main] App component:', App)

	try {
		const router = createRouter({
			history: createWebHistory(),
			routes,
			scrollBehavior(to, from, savedPosition) {
				// If navigating to product page, always scroll to top
				if (to.name === 'Product') {
					return { top: 0 }
				}
				// If there's a saved position (e.g., back button), use it
				if (savedPosition) {
					return savedPosition
				}
				// Otherwise, scroll to top
				return { top: 0 }
			}
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

