<template>
	<header class="site-header masthead" role="banner">
		<nav class="main-navigation site-navigation" :class="{ 'toggled': menuOpen }" role="navigation">
			<button class="menu-toggle hamburger hamburger--squeeze" type="button" @click="toggleMenu"
				:class="{ 'is-active': menuOpen }">
				<span class="hamburger-box">
					<span class="hamburger-inner"></span>
				</span>
			</button>
			<div class="menu-menu-container">
				<ul class="menu menu-menu">
					<li><router-link to="/shop">Shop</router-link></li>
					<li><router-link to="/about">About</router-link></li>
				</ul>
			</div>
		</nav>
		<div class="site-branding">
			<router-link to="/">
				<img class="site-logo" src="/assets/images/fjb-cotton-logo.svg" alt="Farmer John's Botanicals Logo" />
			</router-link>
		</div>
		<div class="fjb-checkout">
			<router-link to="/cart" class="cart-link">
				<span>checkout <span class="cart-count">{{ cartCount > 0 ? `(${cartCount})` : '' }}</span></span>
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

		const updateCartCount = () => {
			cartCount.value = getItemCount()
		}

		const toggleMenu = () => {
			menuOpen.value = !menuOpen.value
		}

		onMounted(() => {
			updateCartCount()
			window.addEventListener('cartUpdated', updateCartCount)
		})

		return {
			menuOpen,
			cartCount,
			toggleMenu,
			handleLogoError
		}
	}
}
</script>

