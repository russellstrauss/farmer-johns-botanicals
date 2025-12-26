<template>
  <div id="app" class="hfeed site">
    <!-- Test: If you see red background, CSS is NOT loading. If you see normal styles, CSS IS loading. -->
    <AppHeader />
    <main class="site-content container">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" v-if="Component" :key="route.path" />
        <div v-else style="padding: 20px; color: orange; font-family: monospace;">
          <h2>Router View Not Rendering</h2>
          <p>Current route: {{ $route.path }}</p>
          <p>Matched routes: {{ $route.matched.length }}</p>
          <p>Please check the browser console for router errors.</p>
        </div>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { onMounted, onErrorCaptured } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    onMounted(() => {
      console.log('[App] App component mounted')
      console.log('[App] Router view should be rendering...')
    })

    onErrorCaptured((err, instance, info) => {
      console.error('[App] Error captured in App component:', err)
      console.error('[App] Component instance:', instance)
      console.error('[App] Error info:', info)
      return false // Prevent error from propagating
    })

    return {}
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

