import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // Garante que referências a process.env não quebrem o app no navegador
    'process.env': {}
  }
});