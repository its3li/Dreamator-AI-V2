import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@vercel/analytics'],
    },
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Add CSS handling configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
