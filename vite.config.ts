import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const apiPlugin = () => ({
  name: 'api-dev-middleware',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/api/health' || url.pathname === '/api/health.js') {
          const healthModule = await import('./api/health.js');
          return await healthModule.default(req, res);
        }
        if (url.pathname === '/api/ura' || url.pathname === '/api/ura.js') {
          const uraModule = await import('./api/ura.js');
          return await uraModule.default(req, res);
        }
        if (url.pathname === '/api/onemap' || url.pathname === '/api/onemap.js') {
          const onemapModule = await import('./api/onemap.js');
          return await onemapModule.default(req, res);
        }
      } catch (err) {
        console.error('API middleware error:', err);
      }
      next();
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
