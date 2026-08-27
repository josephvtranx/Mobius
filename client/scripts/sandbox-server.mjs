// Programmatic Vite config: deliberately does not load vite.config.js or .env files.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import net from 'node:net';
import { welcomeHtml, resetSessionScript } from '../../scripts/sandbox/welcome.mjs';

export async function startSandboxClient({ apiPort, metadata, root }) {
  const target = `http://127.0.0.1:${apiPort}`;
  // Vite treats port 0 as its default port. Ask the OS for a candidate instead;
  // strictPort:false lets Vite advance safely if another process wins the race.
  const port = await new Promise((resolve,reject) => {
    const probe = net.createServer();
    probe.once('error',reject);
    probe.listen(0,'127.0.0.1',() => { const candidate = probe.address().port; probe.close(() => resolve(candidate)); });
  });
  const vite = await createServer({
    configFile: false, envFile: false, envDir: false,
    root: path.join(root,'client'),
    mode: 'sandbox',
    resolve: { alias: { '@': path.join(root,'client/src') } },
    define: { global: 'globalThis',
      'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
      'import.meta.env.VITE_USE_PROXY': JSON.stringify('true'),
      'import.meta.env.VITE_SERVER_ORIGIN': JSON.stringify(target) },
    plugins: [react(), {
      name: 'mobius-local-testing',
      configureServer(server) {
        server.middlewares.use((req,res,next) => {
          if (req.url !== '/__sandbox/' && req.url !== '/__sandbox') return next();
          res.setHeader('Content-Type','text/html; charset=utf-8');
          res.setHeader('Cache-Control','no-store');
          res.end(welcomeHtml(metadata));
        });
      },
      transformIndexHtml() {
        return [{ tag: 'script', children: resetSessionScript(metadata.runId), injectTo: 'head-prepend' }];
      },
    }],
    server: { host: '127.0.0.1', port, strictPort: false,
      proxy: { '/api': { target }, '/uploads': { target } },
      fs: { allow: [root] } },
  });
  try { await vite.listen(); return vite; } catch (error) { await vite.close(); throw error; }
}
