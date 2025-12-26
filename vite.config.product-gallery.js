import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/**
 * Separate Vite config for building the product gallery component
 * This builds a standalone bundle that can be used in WordPress
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: resolve(__dirname, 'wp-content/themes/botanicals/assets/js'),
    emptyOutDir: false, // Don't clear the directory
    rollupOptions: {
      input: resolve(__dirname, 'wp-content/themes/botanicals/assets/js/product-gallery-init.js'),
      output: {
        format: 'iife',
        name: 'ProductGallery',
        entryFileNames: 'product-gallery.js',
        // Bundle all dependencies including Vue
        inlineDynamicImports: true
      },
      external: [] // Bundle everything
    },
    // Ensure Vue is bundled
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})

