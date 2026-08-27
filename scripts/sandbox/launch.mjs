import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile, rm, open, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cleanEnvironment, dependencyFingerprint, npmInstallArgs, healthy, waitForReady } from './runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const state = path.join(root, '.mobius-sandbox');
const lockPath = path.join(state, 'running.json');
const env = cleanEnvironment();
// Vite runs in this process too: do not expose inherited VITE_* or let
// NODE_ENV/NODE_OPTIONS change sandbox behavior.
for (const key of Object.keys(process.env)) delete process.env[key];
Object.assign(process.env, env, { NODE_ENV: 'development' });
const children = new Set();
let temp, vite, log, ownsLock = false, stopping = false;
const runId = randomUUID();
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(code), 7000);
  deadline.unref();
  await vite?.close().catch(() => {});
  await Promise.all([...children].map(child => new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) return resolve();
    child.once('exit', resolve);
    // Only our own detached process groups (includes npm's install children).
    try { process.kill(-child.pid, 'SIGTERM'); } catch { resolve(); }
    const kill = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already stopped */ } resolve(); }, 4500);
    kill.unref();
    child.once('exit', () => clearTimeout(kill));
  })));
  if (temp) await rm(temp, { recursive: true, force: true });
  if (ownsLock) {
    await rm(lockPath, { force: true });
    await rm(path.join(state,'session.json'), { force: true });
  }
  log?.end();
  if (temp) console.log('\nSandbox closed. This session’s test data and photos were discarded.');
  process.exit(code);
}
for (const signal of ['SIGINT','SIGTERM','SIGHUP']) process.on(signal, () => shutdown());
function childProcess(args, options = {}) {
  if (stopping) throw new Error('Sandbox startup cancelled.');
  const child = spawn(process.execPath, args, { cwd: root, env, detached: true, stdio: ['ignore','pipe','pipe'], ...options });
  children.add(child);
  child.stdout?.pipe(log, { end: false }); child.stderr?.pipe(log, { end: false });
  child.once('exit', () => children.delete(child));
  return child;
}
async function acquireLock() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = await open(lockPath, 'wx', 0o600);
      ownsLock = true;
      await handle.writeFile(JSON.stringify({ pid: process.pid, runId })); await handle.close();
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let pid;
      try { ({ pid } = JSON.parse(await readFile(lockPath, 'utf8'))); } catch { /* fail safely */ }
      if (!Number.isInteger(pid) || pid < 1) throw new Error('Launcher lock is incomplete. Close other launchers, then remove .mobius-sandbox/running.json.');
      try { process.kill(pid, 0); } catch (probe) {
        if (probe.code === 'ESRCH') { await rm(lockPath); continue; }
        throw probe;
      }
      throw new Error('A sandbox from this folder is already open. Use that Terminal window or close it before restarting.');
    }
  }
  throw new Error('Could not acquire the sandbox launcher lock. Please retry.');
}
async function install() {
  const fingerprint = await dependencyFingerprint(root);
  let cached = '';
  try { cached = await readFile(path.join(state, 'dependencies'), 'utf8'); } catch { /* first launch */ }
  const paths = ['node_modules/luxon/package.json','server/node_modules/@electric-sql/pglite/package.json','client/node_modules/vite/package.json'];
  const present = await Promise.all(paths.map(p => access(path.join(root,p)).then(() => true, () => false)));
  if (cached === fingerprint && present.every(Boolean)) { console.log('Dependencies ready (cached).'); return; }
  await writeFile(path.join(state,'npm-user.ini'), '');
  await writeFile(path.join(state,'npm-global.ini'), '');
  const npm = path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
  for (const workspace of ['', 'server', 'client']) {
    console.log(`Installing ${workspace || 'shared'} dependencies… (first launch may take several minutes)`);
    const child = childProcess([npm, ...npmInstallArgs(state)], { cwd: path.join(root, workspace), env: { ...env, NODE_ENV: 'development' } });
    await new Promise((resolve,reject) => {
      child.once('error', reject);
      child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Installing ${workspace || 'shared'} dependencies failed. See the setup log for the npm error.`)));
    });
  }
  await writeFile(path.join(state, 'dependencies'), fingerprint);
}
try {
  if (process.platform !== 'darwin') throw new Error('The teammate launcher supports macOS only.');
  await mkdir(state, { recursive: true });
  await acquireLock();
  log = createWriteStream(path.join(state, 'latest.log'), { flags: 'w', mode: 0o600 });
  console.log('Mobius testing sandbox — local only, fresh data every launch.');
  await install();
  temp = await mkdtemp(path.join(tmpdir(), 'mobius-sandbox-'));
  console.log('Creating your academy and practice scenarios…');
  const api = childProcess([path.join(root, 'server/scripts/dev/sandbox.js')], {
    env: { ...env, MOBIUS_SANDBOX_UPLOAD_DIR: path.join(temp, 'uploads'), PORT: '0' },
    stdio: ['ignore','pipe','pipe','ipc'],
  });
  const metadata = await waitForReady(api);
  api.once('exit', () => { if (!stopping) { console.error('The API stopped. See .mobius-sandbox/latest.log.'); void shutdown(1); } });
  await healthy(`http://127.0.0.1:${metadata.port}/health`);
  // Source fingerprint also works for downloaded ZIPs without Git or developer tools.
  const { sourceVersion } = await import('./welcome.mjs');
  metadata.version = await sourceVersion(root);
  metadata.runId = runId;
  const { startSandboxClient } = await import(pathToFileURL(path.join(root, 'client/scripts/sandbox-server.mjs')));
  vite = await startSandboxClient({ apiPort: metadata.port, metadata, root });
  const url = `http://127.0.0.1:${vite.httpServer.address().port}/__sandbox/`;
  await healthy(url);
  await writeFile(path.join(state, 'session.json'), JSON.stringify({ url, ...metadata, uploadDir: path.join(temp,'uploads') }, null, 2));
  console.log(`\nReady: ${url}\nKeep this Terminal window open while testing.\nPress Control+C or close this window to stop and discard all test changes.\nSetup log: ${path.join(state, 'latest.log')}`);
  if (!process.argv.includes('--no-open')) {
    const opener = spawn('/usr/bin/open', [url], { stdio: 'ignore', env });
    opener.on('error', () => console.log(`Open this address manually: ${url}`));
  }
} catch (error) {
  if (!stopping) {
  console.error(`\nCould not start Mobius: ${error.message}\nDetails: ${path.join(state, 'latest.log')}\nNo production data was used.`);
  if (process.stdin.isTTY) {
    console.log('Press Return to close.');
    process.stdin.resume();
    process.stdin.once('data', () => shutdown(1));
  } else await shutdown(1);
  }
}
