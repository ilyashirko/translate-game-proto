import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/eis9pheGoeyaepaiw0oc/",
  server: {
    host: true, // слушать на всех интерфейсах
    allowedHosts: ["develop.ilyashirko.dev", "localhost", "127.0.0.1"],
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'develop.ilyashirko.dev',
    },
  },
})