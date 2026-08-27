import { beforeAll, afterAll, it, expect } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { startTestEnv, SEED_USER } from './helpers/testEnv.js';
import { profilePictureUrl } from '../../client/src/lib/profilePictureUrl.js';

let env, auth;
const created = [];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN2kAAAAASUVORK5CYII=', 'base64');
beforeAll(async () => {
  env = await startTestEnv();
  const login = await request(env.app).post('/api/auth/login').send({email:SEED_USER.email,password:SEED_USER.password});
  auth = `Bearer ${login.body.accessToken}`;
});
afterAll(async () => {
  for (const file of created) await fs.unlink(file).catch(() => {});
  await env?.stop();
});
async function upload(bytes=png, contentType='image/png') {
  const res = await request(env.app).post('/api/upload/profile-picture').set('Authorization',auth)
    .attach('profilePicture',bytes,{filename:'test.png',contentType});
  if (res.body.filename) created.push(path.resolve('uploads',res.body.filename));
  return res;
}
it('resolves media independently of API prefixes', () => {
  expect(profilePictureUrl('/uploads/a.jpg','/api')).toBe('/uploads/a.jpg');
  expect(profilePictureUrl('/uploads/a.jpg','https://example.test/api')).toBe('https://example.test/uploads/a.jpg');
  expect(profilePictureUrl('https://cdn.test/a.jpg')).toBe('https://cdn.test/a.jpg');
  expect(profilePictureUrl('javascript:alert(1)')).toBeNull();
  expect(profilePictureUrl(null)).toBeNull();
});
it('uploads, reads, replaces and deletes a photo with database/file consistency', async () => {
  const first = await upload(); expect(first.status).toBe(200);
  const picture = await request(env.app).get(first.body.imageUrl);
  expect(picture.headers['content-type']).toMatch(/^image\/png/);
  expect(picture.body.equals(png)).toBe(true);
  const second = await upload(); expect(second.status).toBe(200);
  await expect(fs.stat(created[0])).rejects.toMatchObject({code:'ENOENT'});
  const profile = await request(env.app).get('/api/users/profile').set('Authorization',auth);
  expect(profile.body.profile_pic_url).toBe(second.body.imageUrl);
  const loginAgain = await request(env.app).post('/api/auth/login').send({email:SEED_USER.email,password:SEED_USER.password});
  expect(loginAgain.body.user.profile_pic_url).toBe(second.body.imageUrl);
  const removed = await request(env.app).delete('/api/upload/profile-picture').set('Authorization',auth);
  expect(removed.status).toBe(200);
  await expect(fs.stat(created[1])).rejects.toMatchObject({code:'ENOENT'});
  const {rows:[user]} = await env.tenantDb.query('SELECT profile_pic_url FROM users WHERE user_id=1');
  expect(user.profile_pic_url).toBeNull();
});
it('rejects missing, unsupported, disguised and oversized files', async () => {
  expect((await request(env.app).post('/api/upload/profile-picture').set('Authorization',auth)).status).toBe(400);
  expect((await upload(Buffer.from('<html>not an image</html>'))).status).toBe(400);
  expect((await upload(png,'text/plain')).status).toBe(400);
  expect((await upload(Buffer.alloc(5*1024*1024+1))).status).toBe(413);
});
it('requires authentication and disables tenant-wide bulk cleanup', async () => {
  expect((await request(env.app).post('/api/upload/profile-picture').attach('profilePicture',png,'a.png')).status).toBe(401);
  expect((await request(env.app).post('/api/upload/cleanup').set('Authorization',auth)).status).toBe(409);
});
it('does not remove files outside the current tenant namespace', async () => {
  const {removeProfileFile,uploadDir} = await import('../src/middleware/upload.js');
  const name = `OTHER-profile-123-456.png`;
  const file = path.join(uploadDir,name);
  await fs.writeFile(file,png,{flag:'wx'}); created.push(file);
  await removeProfileFile(`/uploads/${name}`,'TEST01',1);
  expect((await fs.readFile(file)).equals(png)).toBe(true);
});
