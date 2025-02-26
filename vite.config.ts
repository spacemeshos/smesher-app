import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import EnvironmentPlugin from 'vite-plugin-environment';

import { version } from './package.json';
import { OFFICIAL_HOSTED_URL, VERSIONS_JSON_URL } from './global';
import { BASE_PATH } from './src/utils/constants';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: BASE_PATH,
  plugins: [
    EnvironmentPlugin(
      mode === 'development' ? {
      'VERSIONS_JSON_URL': VERSIONS_JSON_URL,
      'OFFICIAL_HOSTED_URL': OFFICIAL_HOSTED_URL,
      'APP_VERSION': version,
    } : {}),
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
}));
