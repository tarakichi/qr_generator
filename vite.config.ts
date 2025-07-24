import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "https://tarakichi.github.io/qr_generator",
  plugins: [
    react(),
    tailwindcss(),
  ],
})
