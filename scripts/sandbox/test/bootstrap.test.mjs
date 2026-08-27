import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

for (const failure of ['network','checksum']) {
  test(`bootstrap fails closed on ${failure} failure and cleans partial downloads`, {skip:process.platform!=='darwin'}, async () => {
    const dir=await mkdtemp(path.join(tmpdir(),'mobius bootstrap test '));
    try {
      const bin=path.join(dir,'bin'); await mkdir(bin);
      const script=path.join(dir,'bootstrap.sh');
      // Isolate the cache in a fixture copy, without changing HOME or the real cache.
      const source=await readFile(new URL('../bootstrap.sh',import.meta.url),'utf8');
      await writeFile(script,source.replace('SANDBOX_CACHE="${HOME}/Library/Caches/MobiusSandbox"',`SANDBOX_CACHE="${dir}/cache"`));
      const stub=failure==='network'?'exit 22':`while [ "$#" -gt 0 ]; do if [ "$1" = -o ]; then shift; printf invalid > "$1"; exit 0; fi; shift; done; exit 1`;
      await writeFile(path.join(bin,'curl'),`#!/bin/bash\n${stub}\n`,{mode:0o700});
      const result=spawnSync('/bin/bash',[script],{env:{...process.env,PATH:`${bin}:/usr/bin:/bin:/usr/sbin:/sbin`},encoding:'utf8',timeout:10000});
      assert.notEqual(result.status,0);
      assert.match(result.stdout,/could not start/);
      if (failure==='checksum') assert.match(result.stdout,/verification failed/);
      assert.deepEqual(await readdir(path.join(dir,'cache')),[]);
    } finally { await rm(dir,{recursive:true,force:true}); }
  });
}

test('ZIP installer applies once and rejects changed patches, conflicts and mismatched clones', async () => {
  const repo=await mkdtemp(path.join(tmpdir(),'mobius kit test '));
  const git=(...args)=>{
    const result=spawnSync('git',args,{cwd:repo,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); return result.stdout.trim();
  };
  try {
    git('init','--quiet');
    await writeFile(path.join(repo,'package.json'),'{}\n');
    await writeFile(path.join(repo,'app.js'),'original\n');
    await writeFile(path.join(repo,'Start Mobius.command'),'#!/bin/bash\necho launcher_reached\n');
    git('add','.');
    git('-c','user.name=Sandbox Test','-c','user.email=sandbox@example.invalid','commit','--quiet','-m','fixture');
    const base=git('rev-parse','HEAD');
    await writeFile(path.join(repo,'app.js'),'updated\n');
    const patch=git('diff','--binary','--full-index')+'\n';
    await writeFile(path.join(repo,'app.js'),'original\n');
    const kit=path.join(repo,'Mobius-Test-Kit'); await mkdir(kit);
    const template=await readFile(new URL('../kit/start.sh',import.meta.url),'utf8');
    await writeFile(path.join(kit,'start.sh'),template.replace('@BASE_COMMIT@',base)
      .replace('@PATCH_SHA@',createHash('sha256').update(patch).digest('hex')));
    await writeFile(path.join(kit,'app.patch'),patch);
    const run=()=>spawnSync('/bin/bash',[path.join(kit,'start.sh')],{encoding:'utf8',timeout:10000});
    let result=run();
    assert.equal(result.status,0,result.stderr); assert.match(result.stdout,/launcher_reached/);
    assert.equal(await readFile(path.join(repo,'app.js'),'utf8'),'updated\n');
    result=run(); assert.equal(result.status,0,result.stderr); assert.match(result.stdout,/already installed/);
    await writeFile(path.join(kit,'app.patch'),patch+'tampered');
    result=run(); assert.notEqual(result.status,0); assert.match(result.stderr,/failed verification/);
    await writeFile(path.join(kit,'app.patch'),patch);
    await writeFile(path.join(repo,'app.js'),'my local work\n');
    result=run(); assert.notEqual(result.status,0); assert.match(result.stderr,/conflicts/);
    assert.equal(await readFile(path.join(repo,'app.js'),'utf8'),'my local work\n');
    git('add','app.js');
    git('-c','user.name=Sandbox Test','-c','user.email=sandbox@example.invalid','commit','--quiet','-m','different base');
    result=run(); assert.notEqual(result.status,0); assert.match(result.stderr,/different repo version/);
  } finally { await rm(repo,{recursive:true,force:true}); }
});
