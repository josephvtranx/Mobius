import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import vm from 'node:vm';
import { cleanEnvironment, waitForReady, healthy } from '../runtime.mjs';
import { resetSessionScript } from '../welcome.mjs';
import http from 'node:http';

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
