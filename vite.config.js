import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { apiMiddleware } from './vite-plugin-api.js'

export default defineConfig({
  plugins: [vue(), apiMiddleware()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'slash-div']
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      // Let Vite use index.html as the entry point (default behavior)
      // This ensures the Vue SPA is built correctly
      input: resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'stripe': ['@stripe/stripe-js']
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  publicDir: 'public'
})

