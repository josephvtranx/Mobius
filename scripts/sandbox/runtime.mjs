import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Allowlist rather than inheriting database credentials, NODE_OPTIONS, proxies,
// npm configuration or VITE_* values from a developer's shell.
export function cleanEnvironment(source = process.env) {
  const env = {};
  for (const key of ['HOME','TMPDIR','LANG','LC_ALL','TERM']) if (source[key]) env[key] = source[key];
  env.PATH = `${path.dirname(process.execPath)}:/usr/bin:/bin:/usr/sbin:/sbin`;
  return env;
}

export async function dependencyFingerprint(root) {
  const hash = createHash('sha256').update(`${process.version}:${process.arch}:install-v1`);
  for (const workspace of ['', 'server', 'client']) {
    for (const file of ['package.json','package-lock.json']) hash.update(await readFile(path.join(root, workspace, file)));
  }
  return hash.digest('hex');
}

export function npmInstallArgs(state) {
  return ['ci', '--include=dev', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org',
    // A tester's ~/.npm may contain files owned by another user. Keep all
    // package downloads and npm logs in the sandbox's own writable cache.
    `--cache=${path.join(state, 'npm-cache')}`,
    `--userconfig=${path.join(state, 'npm-user.ini')}`, `--globalconfig=${path.join(state, 'npm-global.ini')}`];
}

export function waitForReady(child, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const finish = (error, value) => {
      clearTimeout(timer);
      child.off('message', message); child.off('exit', exit); child.off('error', failure);
      if (error) reject(error); else resolve(value);
    };
    const message = value => {
      if (value?.type === 'ready') finish(null, value);
      if (value?.type === 'failed') finish(new Error(value.message));
    };
    const exit = () => finish(new Error('The sandbox API stopped before it was ready.'));
    const failure = error => finish(error);
    const timer = setTimeout(() => finish(new Error('Sandbox setup timed out. Close and retry.')), timeoutMs);
    child.on('message', message); child.once('exit', exit); child.once('error', failure);
  });
}

export async function healthy(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Local health check failed (${response.status}).`);
  return response;
}
