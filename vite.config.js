import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        raven: 'src/raven.js',
        styles: 'src/style.css'
      },
      output: {
        entryFileNames: 'raven.min.js',
        assetFileNames: 'raven.min.css',
        format: 'cjs'
      }
    },
    emptyOutDir: true
  }
})
