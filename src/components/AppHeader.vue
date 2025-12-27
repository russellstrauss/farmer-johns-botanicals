<template>
	<header class="site-header container" role="banner">
		<nav class="main-navigation" :class="{ 'toggled': menuOpen }" role="navigation">
			<button class="menu-toggle hamburger hamburger--squeeze" type="button" @click="toggleMenu"
				:class="{ 'is-active': menuOpen }">
				<span class="hamburger-box">
					<span class="hamburger-inner"></span>
				</span>
			</button>
			<div class="menu-container">
				<ul class="menu">
					<li><router-link to="/shop" @click="closeMenu">Shop</router-link></li>
					<li><router-link to="/about" @click="closeMenu">About</router-link></li>
				</ul>
			</div>
		</nav>
		<div class="site-branding">
			<router-link to="/">
				<img class="site-logo" src="/assets/images/fjb-cotton-logo.svg" alt="Farmer John's Botanicals Logo" />
			</router-link>
		</div>
		<router-link v-if="!isCartPage && cartCount > 0" to="/cart" class="basket-toggle">
			<img src="/assets/images/icon/basket.svg" alt="Shopping Cart" class="basket-icon" />
			<span class="cart-badge">{{ cartCount }}</span>
		</router-link>
	</header>
</template>

<script>
import { useCart } from '../composables/useCart'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
	name: 'AppHeader',
	setup() {
		const { getItemCount } = useCart()
		const route = useRoute()
		const menuOpen = ref(false)
		const cartCount = ref(0)
		
		const isCartPage = computed(() => route.path === '/cart')

		const updateCartCount = () => {
			cartCount.value = getItemCount()
		}

		const toggleMenu = () => {
			menuOpen.value = !menuOpen.value
		}

		const closeMenu = () => {
			menuOpen.value = false
		}

		onMounted(() => {
			updateCartCount()
			window.addEventListener('cartUpdated', updateCartCount)
		})

		return {
			menuOpen,
			cartCount,
			isCartPage,
			toggleMenu,
			closeMenu
		}
	}
}
</script>

