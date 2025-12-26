<template>
  <div v-if="relatedProducts.length > 0" class="related-products">
    <h2 class="related-products-title">Related Products</h2>
    <ul class="products">
      <li v-for="product in relatedProducts" :key="product.id" class="product">
        <router-link :to="`/product/${product.slug}`">
          <div class="product-image-wrapper" :style="{ backgroundImage: `url(${getProductImage(product)})` }">
            <img :src="getProductImage(product)" :alt="product.name" />
          </div>
          <span v-if="product.sale_price" class="sale-badge">Sale</span>
          <h3 class="product-title">{{ product.name }}</h3>
          <span class="price">
            <span class="amount">
              <span v-if="product.sale_price" class="sale-price">{{ formatPrice(product.sale_price) }}</span>
              <span :class="{ 'regular-price': product.sale_price }">{{ formatPrice(product.price) }}</span>
            </span>
          </span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useProducts } from '../composables/useProducts'
import { useCart } from '../composables/useCart'

export default {
  name: 'RelatedProducts',
  props: {
    productId: {
      type: [String, Number],
      required: true
    },
    limit: {
      type: Number,
      default: 4
    }
  },
  setup(props) {
    const { getRelatedProducts } = useProducts()
    const { formatPrice } = useCart()

    const relatedProducts = computed(() => {
      return getRelatedProducts(props.productId, props.limit)
    })

    const getProductImage = (product) => {
      return product.images && product.images.length > 0 
        ? product.images[0] 
        : '/assets/images/placeholder.jpg'
    }

    return {
      relatedProducts,
      getProductImage,
      formatPrice
    }
  }
}
</script>

<style scoped lang="scss">
.related-products {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e0e0e0;

  .related-products-title {
    margin-bottom: 30px;
    font-size: 24px;
    font-weight: bold;
  }
}
</style>

