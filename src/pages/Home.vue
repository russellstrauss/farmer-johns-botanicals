<template>
  <div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">
      <div class="shop-front">
        <router-link to="/shop">
          <div class="jewelry-page-link all" style="background-image: url(/assets/images/all-jewelry.jpg);">
            <div class="overlay"></div>
            <div class="text">all jewelry</div>
          </div>
        </router-link>
        <div class="profile-pics">
          <router-link to="/shop?tag=dustin">
            <div class="jewelry-page-link dustin" style="background-image: url(/assets/images/dustin-page-photo.jpg);">
              <div class="overlay"></div>
              <div class="text">Dustin</div>
            </div>
          </router-link>
          <router-link to="/shop?tag=hillary">
            <div class="jewelry-page-link hillary" style="background-image: url(/assets/images/hillary-page-photo.jpg);">
              <div class="overlay"></div>
              <div class="text">Hillary</div>
            </div>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted } from 'vue'

export default {
  name: 'Home',
  setup() {
    onMounted(() => {
      console.log('[Home] Home component mounted successfully')
      console.log('[Home] Component is rendering')
    })

    return {}
  }
}
</script>

