import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  resolve: {
    // 🔑 Prevent multiple React copies when using linked local packages
    dedupe: ['react', 'react-dom'],
  },
});
