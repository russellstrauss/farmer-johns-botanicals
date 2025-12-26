<template>
  <div id="app" class="hfeed site">
    <!-- Test: If you see red background, CSS is NOT loading. If you see normal styles, CSS IS loading. -->
    <AppHeader />
    <main class="site-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  }
}
</script>

<style>
/* Base app styles - these should be minimal since style.css handles most styling */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* If you see this red background, the external CSS is NOT loading */
body {
  /* Remove this line once CSS is confirmed working */
  /* background: red !important; */
}
</style>

