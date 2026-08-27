import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import vm from 'node:vm';
import { cleanEnvironment, npmInstallArgs, waitForReady, healthy } from '../runtime.mjs';
import { resetSessionScript } from '../welcome.mjs';
import http from 'node:http';

const runFile = promisify(execFile);

test('npm installs all workspaces with a private cache when the configured cache is unusable', { timeout:60000 }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mobius npm cache Möbius '));
  try {
    const state = path.join(root, '.mobius-sandbox');
    const blocked = path.join(root, 'unusable-cache');
    await mkdir(state);
    // A file instead of a directory reliably rejects cache writes even under
    // privileged CI users, without touching HOME or anyone's real ~/.npm.
    await writeFile(blocked, 'leave this personal cache untouched');
    for (const file of ['npm-user.ini', 'npm-global.ini']) await writeFile(path.join(state, file), '');
    const fixture = path.join(root, 'package');
    await mkdir(fixture);
    await writeFile(path.join(fixture, 'package.json'), JSON.stringify({name:'cache-probe', version:'1.0.0'}));
    const archive = path.join(root, 'cache-probe.tgz');
    await runFile('tar', ['-czf', archive, '-C', root, 'package']);
    const integrity = `sha512-${createHash('sha512').update(await readFile(archive)).digest('base64')}`;
    for (const workspace of ['', 'server', 'client']) {
      const cwd = path.join(root, workspace);
      await mkdir(cwd, {recursive:true});
      const manifest = {name:`fixture-${workspace || 'root'}`, version:'1.0.0', dependencies:{'cache-probe':`file:${archive}`}};
      await writeFile(path.join(cwd, 'package.json'), JSON.stringify(manifest));
      await writeFile(path.join(cwd, 'package-lock.json'), JSON.stringify({
        name:manifest.name, version:manifest.version, lockfileVersion:3, requires:true,
        packages:{'':manifest, 'node_modules/cache-probe':{version:'1.0.0', resolved:`file:${archive}`, integrity}},
      }));
      await writeFile(path.join(cwd, '.npmrc'), `cache=${blocked}\n`);
      const args = [...npmInstallArgs(state), '--offline'];
      const options = {cwd, env:{...cleanEnvironment(), PATH:process.env.PATH, npm_config_cache:blocked}, timeout:15000};
      if (!workspace) {
        // Prove the old default fails; the new CLI cache override must fix it.
        await assert.rejects(runFile('npm', args.filter(arg => !arg.startsWith('--cache=')), options),
          error => /ENOTDIR|EACCES|EEXIST/.test(error.stderr));
      }
      await runFile('npm', args, options);
      const installed = JSON.parse(await readFile(path.join(cwd, 'node_modules/cache-probe/package.json'), 'utf8'));
      assert.equal(installed.name, 'cache-probe');
    }
    assert.ok((await readdir(path.join(state, 'npm-cache/_cacache/content-v2'))).length > 0);
    assert.equal(await readFile(blocked, 'utf8'), 'leave this personal cache untouched');
  } finally { await rm(root, {recursive:true, force:true}); }
});

test('environment excludes production and runtime overrides', () => {
  const env = cleanEnvironment({HOME:'/test',REGISTRY_URL:'remote',RESEND_API_KEY:'secret',VITE_API_URL:'remote',NODE_OPTIONS:'--inspect',npm_config_registry:'remote'});
  assert.equal(env.HOME,'/test');
  for (const key of ['REGISTRY_URL','RESEND_API_KEY','VITE_API_URL','NODE_OPTIONS','npm_config_registry']) assert.equal(env[key],undefined);
  assert.ok(env.PATH.endsWith('/usr/bin:/bin:/usr/sbin:/sbin'));
});
test('readiness handles success, API failure, early exit and timeout without leaked listeners', async () => {
  for (const event of ['ready','failed','exit','timeout']) {
    const child = new EventEmitter();
    const result = waitForReady(child,20);
    if (event === 'ready') child.emit('message',{type:'ready',port:1234});
    if (event === 'failed') child.emit('message',{type:'failed',message:'seed failed'});
    if (event === 'exit') child.emit('exit',1);
    if (event === 'ready') assert.equal((await result).port,1234);
    else await assert.rejects(result);
    assert.equal(child.listenerCount('message'),0);
    assert.equal(child.listenerCount('exit'),0);
  }
});
test('session reset clears only app auth on a new run, preserving same-run sign-ins', () => {
  const values = new Map([['token','old'],['refreshToken','old'],['adminToken','old'],['user','old'],['unrelated','keep']]);
  const localStorage = { getItem:k=>values.get(k), setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k) };
  vm.runInNewContext(resetSessionScript('run-a'),{localStorage});
  assert.equal(values.get('token'),undefined); assert.equal(values.get('adminToken'),undefined); assert.equal(values.get('unrelated'),'keep');
  values.set('token','new');
  vm.runInNewContext(resetSessionScript('run-a'),{localStorage});
  assert.equal(values.get('token'),'new');
  vm.runInNewContext(resetSessionScript('run-b'),{localStorage});
  assert.equal(values.get('token'),undefined);
});
test('health checks reject non-success HTTP responses', async () => {
  const server = http.createServer((req,res)=>{res.statusCode=req.url==='/ok'?200:503;res.end();});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try { await healthy(`${base}/ok`); await assert.rejects(healthy(`${base}/failed`)); }
  finally { await new Promise(resolve=>server.close(resolve)); }
});
