
<template>
	<div class="greetings">
		<h1 class="green">{{ msg }}</h1>
		<h3>Welcome to Farmer John's Magical Shop.</h3>

		<ul>
			<li class="products" v-for="(product, index) in products" :key="product.id" :data-index="index">
				{{ product.name }}
			</li>
		</ul>

		<div class="shop-front">
			<ul>
				<li style="background-image: url(shirts.jpg);">
					<div class="title">Fashion</div>
				</li>
				<li style="background-image: url(seeds.jpg);">
					<div class="title">Garden</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
	import axios from 'axios';

	export default {
		
		name: 'ShopFront',

		data() {
			return {
				category: {},
				products: []
			};
		},

		created: function() {
			// $http.get('http://localhost:5173/wp-json/wp/v2/posts').then(response => {
			// 	console.log(response);
			// });

			
		},

		methods: {
			getPieces: function() {

				
				
				return response.data;
			}
		},

		created: function () {
			let baseUrl = 'https://local.farmerjohnsbotanicals.com/';
			let endpoint = '/wp-json/wc/v3/products';
			let url = baseUrl + endpoint;
			let respone = null;

			let response = axios.get(url, {
				auth: {
					username: 'ck_da36d7950362caf9a235ac1047a163f3d4760555',
					password: 'cs_fb826b74b0318a2a052564bfb2552ee70c0991e9'
				}
			}).then(response => {
				this.products = response.data;
				console.log(response.data);
			});
		}
	};
</script>

<style lang="scss">
	.shop-front {

		ul {
			margin: 0;
			list-style: none;
			padding: 0;
			@include grid(2, 20px);
			
			li {
				@include aspect-ratio(1, 1);
				display: flex;
				align-items: center;
				border: 10px solid black;
				text-align: center;
				color: white;
				background-color: black;

				.title {
					@include lato;
					font-weight: 900;
					display: block;
					width: 100%;
					font-size: 60px;
				}
			}
		}
	}
</style>