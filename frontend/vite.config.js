import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('framer-motion')) return 'animation-vendor';
            if (id.includes('react-google-charts') || id.includes('google-charts')) return 'charts-vendor';
            if (id.includes('react-icons')) return 'icons-vendor';
            if (id.includes('react-router')) return 'router-vendor';
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
