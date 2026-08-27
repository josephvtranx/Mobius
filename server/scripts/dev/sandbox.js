// Isolated API worker. The launcher owns frontend, readiness and cleanup.
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.MOBIUS_SANDBOX = '1';
process.env.NODE_ENV = 'test';
process.env.JOBS_DISABLED = '1';
process.env.RESEND_API_KEY = '';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.REFRESH_TOKEN_SECRET = randomBytes(48).toString('hex');
process.env.PG_POOL_MAX = '1';
const ownUploads = !process.env.MOBIUS_SANDBOX_UPLOAD_DIR;
if (ownUploads) process.env.MOBIUS_SANDBOX_UPLOAD_DIR = await mkdtemp(path.join(tmpdir(), 'mobius-uploads-'));
let env, listener, stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(code), 4000);
  timeout.unref();
  listener?.closeAllConnections();
  if (listener) await new Promise(resolve => listener.close(resolve));
  await env?.stop();
  if (ownUploads) await rm(process.env.MOBIUS_SANDBOX_UPLOAD_DIR, { recursive: true, force: true });
  process.exit(code);
}
for (const signal of ['SIGINT','SIGTERM','SIGHUP']) process.on(signal, () => stop());
process.on('disconnect', () => stop());
try {
  const { startTestEnv } = await import('../../test/helpers/testEnv.js');
  const { seedAcademy } = await import('./seedAcademy.js');
  const { seedScenarios, DEMO_ACCOUNTS } = await import('./seedScenarios.js');
  env = await startTestEnv();
  const academy = await seedAcademy(env);
  const scenarios = await seedScenarios(env, academy);
  listener = env.app.listen(Number(process.env.PORT ?? 0), '127.0.0.1');
  await new Promise((resolve, reject) => { listener.once('listening', resolve); listener.once('error', reject); });
  const port = listener.address().port;
  process.send?.({ type: 'ready', port, scenarios, accounts: DEMO_ACCOUNTS, counts: academy.counts,
    uploadDir: process.env.MOBIUS_SANDBOX_UPLOAD_DIR, launchedAt: academy.now.toUTC().toISO() });
  console.log(`Sandbox API ready at http://127.0.0.1:${port}. Fresh data; outbound email and jobs disabled.`);
} catch (error) {
  console.error('Sandbox startup failed:', error.message);
  process.send?.({ type: 'failed', message: error.message });
  await stop(1);
}
