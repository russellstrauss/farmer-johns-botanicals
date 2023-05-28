<script setup>
	import HelloWorld from './components/HelloWorld.vue';
	import ShopFront from './components/shop/ShopFront.vue';
</script>

<template>
	<header>
		<img class="logo" alt="Farmer John's Botanicals logo; Farmer John in a tie dye shirt and overalls with a pitch fork and long hair flowing in the wind next to organic looking text with tree roots growing from the bottom" src="./assets/img/logo.jpg" />
	</header>

	<main class="fjb-main">
		<ShopFront></ShopFront>
	</main>
</template>

<style lang="scss">
	.fjb-main {
		@include container;
	}
	.logo {
		display: block;
		margin: 20px auto;
		border-radius: 10px;
		max-width: 600px;
		margin-bottom: 100px;
	}
</style>
