import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Essential for Electron file:// and relative asset loading
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    open: false
  }
})
