<template>
  <div id="app" class="app">
    <AppHeader />
    <main class="site-content container">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" v-if="Component" :key="route.path" />
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { onErrorCaptured } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {

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
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

