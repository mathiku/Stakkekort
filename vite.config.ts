import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    assetsInlineLimit: 0, // Ensure that all assets are processed as files
    rollupOptions: {
      external: [
        /leaflet\/dist\/images\/.*/  // Exclude Leaflet's default images
      ]
    }
  }
});
