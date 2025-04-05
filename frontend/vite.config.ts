// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // Point to your frontend directory
  server: {
    open: true // Automatically open browser
  }
})