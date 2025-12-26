import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './routes'

// Import SASS - Vite will process this
import './assets/sass/style.scss'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')

// Add woocommerce class to body for styling
document.body.classList.add('woocommerce')

