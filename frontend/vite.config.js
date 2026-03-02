import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://navkalpana-ricr-nk-0081-lkkv.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
