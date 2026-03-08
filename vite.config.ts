import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { APPS_SCRIPT_DEPLOYMENT_ID } from './src/app/config/constants'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      "/apps-script": {
        target: "https://script.google.com",
        changeOrigin: true,
        secure: true,
        // Keep redirect handling in the proxy so POST payloads are preserved.
        followRedirects: true,
        rewrite: (path) =>
          path.replace(
            /^\/apps-script/,
            `/macros/s/${APPS_SCRIPT_DEPLOYMENT_ID}/exec`
          ),
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
