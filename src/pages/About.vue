<template>
  <div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">
      <h1>About Farmer John's Botanicals</h1>
      <div class="about-content" v-html="aboutContent"></div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'About',
  setup() {
    const aboutContent = ref('')

    onMounted(async () => {
      try {
        const response = await fetch('/data/about.json')
        if (response.ok) {
          const data = await response.json()
          aboutContent.value = data.content || '<p>Welcome to Farmer John\'s Botanicals. We create handcrafted jewelry with care and attention to detail.</p>'
        } else {
          aboutContent.value = '<p>Welcome to Farmer John\'s Botanicals. We create handcrafted jewelry with care and attention to detail.</p>'
        }
      } catch (error) {
        console.error('Error loading about content:', error)
        aboutContent.value = '<p>Welcome to Farmer John\'s Botanicals. We create handcrafted jewelry with care and attention to detail.</p>'
      }
    })

    return {
      aboutContent
    }
  }
}
</script>


