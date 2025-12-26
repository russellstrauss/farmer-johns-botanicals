// Diagnostic logging for route imports
console.log('[Routes] Loading route components...')

import Home from './pages/Home.vue'
console.log('[Routes] Home component loaded:', Home)

import Shop from './pages/Shop.vue'
import Product from './pages/Product.vue'
import Cart from './pages/Cart.vue'
import About from './pages/About.vue'
import Success from './pages/Success.vue'
import Admin from './pages/Admin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/shop',
    name: 'Shop',
    component: Shop
  },
  {
    path: '/product/:slug',
    name: 'Product',
    component: Product,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/success',
    name: 'Success',
    component: Success
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true }
  }
]

console.log('[Routes] All routes configured:', routes)

export default routes

