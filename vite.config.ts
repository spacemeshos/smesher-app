import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: function manualChunks(id) {
          // Bundle all third-party code aside
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
    },
  },
});
