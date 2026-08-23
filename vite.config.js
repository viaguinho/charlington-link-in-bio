import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Caminho relativo: o build roda em qualquer host, em raiz ou subpasta.
  base: './',
  plugins: [react(), tailwindcss()],
})
