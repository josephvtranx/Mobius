import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanEnvironment, waitForReady } from '../runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
async function start(cwd) {
  const child = spawn(process.execPath,[path.join(root,'server/scripts/dev/sandbox.js')], {
    cwd, env: {...cleanEnvironment(),REGISTRY_URL:'postgres://invalid@127.0.0.1:9/forbidden',RESEND_API_KEY:'must-not-use',PORT:'0'},
    stdio: ['ignore','pipe','pipe','ipc'],
  });
  let output=''; child.stdout.on('data',data=>{output+=data;});child.stderr.on('data',data=>{output+=data;});
  try { const meta=await waitForReady(child); return {child,meta,base:`http://127.0.0.1:${meta.port}`}; }
  catch (error) { child.kill('SIGTERM'); throw new Error(`${error.message}: ${output}`); }
}
async function stop(worker) {
  if (!worker || worker.child.exitCode !== null) return;
  const done = new Promise(resolve=>worker.child.once('exit',resolve));
  worker.child.kill('SIGTERM'); await done;
  await assert.rejects(access(worker.meta.uploadDir));
}
const json = async (base,url,body,token) => {
  const response=await fetch(base+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status,body:await response.json()};
};
test('API reset isolates photos, credentials, database and dotenv across two launches', {timeout:60000}, async () => {
  const cwd=await mkdtemp(path.join(tmpdir(),'mobius worker test '));
  await writeFile(path.join(cwd,'.env'),'JWT_SECRET=must-not-load\nREGISTRY_URL=postgres://invalid@127.0.0.1:9/nope\n');
  let first,second;
  try {
    first=await start(cwd);
    const localCors=await fetch(first.base+'/api/auth/login',{method:'OPTIONS',headers:{Origin:'http://127.0.0.1:54321','Access-Control-Request-Method':'POST'}});
    assert.equal(localCors.headers.get('access-control-allow-origin'),'http://127.0.0.1:54321');
    const remoteCors=await fetch(first.base+'/health',{headers:{Origin:'https://example.invalid'}});
    assert.equal(remoteCors.headers.get('access-control-allow-origin'),null);
    const login=await json(first.base,'/api/auth/login',{email:'staff@test.com',password:'Password123!'});
    assert.equal(login.status,200);
    const form=new FormData();
    form.set('profilePicture',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN2kAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'test.png');
    const uploaded=await fetch(first.base+'/api/upload/profile-picture',{method:'POST',headers:{Authorization:`Bearer ${login.body.accessToken}`},body:form});
    assert.equal(uploaded.status,200);
    const {imageUrl}=await uploaded.json();
    await access(path.join(first.meta.uploadDir,path.basename(imageUrl)));
    await stop(first);
    second=await start(cwd);
    assert.notEqual(second.meta.uploadDir,first.meta.uploadDir);
    assert.equal((await json(second.base,'/api/users/profile',null,login.body.accessToken)).status,401);
    const fresh=await json(second.base,'/api/auth/login',{email:'staff@test.com',password:'Password123!'});
    assert.equal(fresh.body.user.profile_pic_url,null);
    // Express SPA fallback can return 200 HTML; it must never return the old image.
    const oldImage=await fetch(second.base+imageUrl);
    assert.ok(!oldImage.headers.get('content-type')?.startsWith('image/'));
    assert.equal((await json(second.base,'/api/auth/refresh-token',{refreshToken:login.body.refreshToken})).status,401);
  } finally { await stop(first); await stop(second); await rm(cwd,{recursive:true,force:true}); }
});
