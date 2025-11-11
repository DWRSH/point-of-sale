import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // 🔥 necessary for React Router
  build: {
    outDir: 'dist',
  },
  server: {
    historyApiFallback: true, // ensures fallback for client routes during dev
  },
})
