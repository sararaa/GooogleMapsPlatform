import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    https: false,
    strictPort: true,
    cors: true,
    headers: {
      'Strict-Transport-Security': 'max-age=0',
    }
  },
  preview: {
    port: 5174,
    https: false,
    strictPort: true,
    cors: true,
    headers: {
      'Strict-Transport-Security': 'max-age=0',
    }
  }
})