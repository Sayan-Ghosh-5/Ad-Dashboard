import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Optional dev proxy: uncomment to call the backend via the same origin
    // and sidestep CORS during development.
    // proxy: {
    //   '/events': 'http://localhost:8080',
    //   '/campaigns': 'http://localhost:8080',
    //   '/health': 'http://localhost:8080',
    // },
  },
})
