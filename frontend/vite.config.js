import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      port: 5180,
      strictPort: true,
      // W trybie dev żądania /api trafiają do backendu – brak problemów z CORS
      proxy: {
        '/api': env.VITE_API_PROXY_TARGET || 'http://localhost:3001',
      },
    },
  };
});
