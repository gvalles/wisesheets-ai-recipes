import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var apiKey = env.WISESHEETS_API_KEY;
    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api/wisesheets': {
                    target: 'https://api.wisesheets.io',
                    changeOrigin: true,
                    rewrite: function (path) { return path.replace(/^\/api\/wisesheets/, ''); },
                    configure: function (proxy) {
                        proxy.on('proxyReq', function (proxyReq) {
                            if (apiKey) {
                                proxyReq.setHeader('Authorization', "Bearer ".concat(apiKey));
                            }
                        });
                    }
                }
            }
        }
    };
});
