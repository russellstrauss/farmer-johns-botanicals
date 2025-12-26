<template>
  <header id="masthead" class="site-header" role="banner">
    <nav id="site-navigation" class="main-navigation" :class="{ 'toggled': menuOpen }" role="navigation">
      <button 
        class="menu-toggle hamburger hamburger--squeeze" 
        type="button"
        @click="toggleMenu"
        :class="{ 'is-active': menuOpen }"
      >
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>
      <div class="menu-menu-container">
        <ul id="menu-menu" class="menu">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/shop">Shop</router-link></li>
          <li><router-link to="/about">About</router-link></li>
        </ul>
      </div>
    </nav>
    <div class="site-branding">
      <router-link to="/">
        <img 
          v-if="logoExists"
          id="site-logo" 
          src="/assets/images/logo.png" 
          alt="Farmer John's Botanicals Logo"
          @error="handleLogoError"
        />
        <span v-else class="text-logo">Farmer John's Botanicals</span>
      </router-link>
    </div>
    <div class="fjb-checkout">
      <router-link to="/cart" class="cart-link">
        <span>checkout <span class="cart-count">{{ cartCount > 0 ? `(${cartCount})` : '' }}</span></span>
        <div class="bling-shark-container">
          <div class="bling-shark"></div>
          <div class="bling-shark-hover"></div>
        </div>
      </router-link>
    </div>
  </header>
</template>

<script>
import { useCart } from '../composables/useCart'
import { computed, ref, onMounted } from 'vue'

export default {
  name: 'AppHeader',
  setup() {
    const { getItemCount } = useCart()
    const menuOpen = ref(false)
    const cartCount = ref(0)
    const logoExists = ref(true)

    const updateCartCount = () => {
      cartCount.value = getItemCount()
    }

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value
    }

    const handleLogoError = () => {
      logoExists.value = false
    }

    onMounted(() => {
      updateCartCount()
      window.addEventListener('cartUpdated', updateCartCount)
    })

    return {
      menuOpen,
      cartCount,
      logoExists,
      toggleMenu,
      handleLogoError
    }
  }
}
</script>

