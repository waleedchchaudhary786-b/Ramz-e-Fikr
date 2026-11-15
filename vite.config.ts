import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE is the path the site is served from.
// "/" for a custom domain, "/<repo-name>/" for a GitHub Pages project site.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
