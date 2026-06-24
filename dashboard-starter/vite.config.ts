import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: {
  cwd: () => string;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.WISESHEETS_API_KEY;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/wisesheets': {
          target: 'https://api.wisesheets.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/wisesheets/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
              }
            });
          }
        }
      }
    }
  };
});
