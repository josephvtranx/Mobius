// Email delivery (spec 08 channels / GRD-5 opt-in): notifyFamily queues
// channel='email' rows only for guardians with prefs.email === true (mode
// rules still apply), and runEmailDelivery drains the queue via an
// injectable transport — no real Resend calls ever happen in tests
// (testEnv blanks RESEND_API_KEY).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestEnv, TEST_CODE } from './helpers/testEnv.js';
import { notifyFamily } from '../src/helpers/notify.js';
import { runEmailDelivery, renderEmail } from '../src/jobs/emailJobs.js';

let env;
let db;

async function seed() {
  await env.tenantDb.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Student','stu@test.com','student'),        -- 2
      ('h','G Email','g-email@test.com','guardian'),   -- 3 email opt-in, mode all
      ('h','G Plain','g-plain@test.com','guardian'),   -- 4 default prefs (no email)
      ('h','G Billing','g-billing@test.com','guardian'); -- 5 billing_only + email
    INSERT INTO students (student_id, status) VALUES (2,'enrolled');
    INSERT INTO guardians (user_id, relationship) VALUES (3,'parent'),(4,'parent'),(5,'parent');
    INSERT INTO student_guardians (student_id, guardian_id, is_primary, notification_prefs) VALUES
      (2, (SELECT guardian_id FROM guardians WHERE user_id = 3), true,  '{"mode":"all","email":true}'),
      (2, (SELECT guardian_id FROM guardians WHERE user_id = 4), false, '{}'),
      (2, (SELECT guardian_id FROM guardians WHERE user_id = 5), false, '{"mode":"billing_only","email":true}');
  `);
}

async function emailRows() {
  const { rows } = await env.tenantDb.query(
    `SELECT recipient_user_id, event_type, status FROM notification_log
      WHERE channel = 'email' ORDER BY notification_id`);
  return rows;
}

beforeAll(async () => {
  env = await startTestEnv();
  db = await env.getTenantPool(TEST_CODE);
  await seed();
}, 120_000);

afterAll(async () => { await env.stop(); });

describe('email enqueue (GRD-5 opt-in)', () => {
  it('non-billing event: only the opted-in mode-all guardian gets an email row', async () => {
    await notifyFamily(db, {
      studentId: 2, eventType: 'schedule_change', subjectType: 'class', subjectId: 'c1',
      payload: { note: 'moved rooms' }
    });
    const rows = await emailRows();
    expect(rows).toHaveLength(1);
    expect(rows[0].recipient_user_id).toBe(3); // billing_only guardian muted, plain guardian not opted in
    expect(rows[0].status).toBe('queued');
  });

  it('billing event: billing_only + opted-in guardian gets one too', async () => {
    await notifyFamily(db, {
      studentId: 2, eventType: 'wallet_credited', subjectType: 'wallet', subjectId: '2',
      payload: { delta: 10, balance: 40 }
    });
    const rows = await emailRows();
    expect(rows.filter(r => r.event_type === 'wallet_credited').map(r => r.recipient_user_id).sort())
      .toEqual([3, 5]);
  });
});

describe('runEmailDelivery', () => {
  it('drains the queue through the injected transport and marks rows sent', async () => {
    const sends = [];
    const res = await runEmailDelivery(db, '2026-07-18T12:00:00.000Z', {
      send: async (msg) => sends.push(msg)
    });
    expect(res).toEqual({ sent: 3, failed: 0 });
    expect(sends.map(s => s.to).sort()).toEqual(['g-billing@test.com', 'g-email@test.com', 'g-email@test.com']);
    const credited = sends.find(s => s.subject === 'Credits added to your wallet');
    expect(credited.text).toContain('10');
    const { rows } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM notification_log WHERE channel='email' AND status='sent' AND sent_at IS NOT NULL`);
    expect(rows[0].n).toBe(3);

    // idempotent: nothing queued remains
    const again = await runEmailDelivery(db, undefined, { send: async () => {} });
    expect(again).toEqual({ sent: 0, failed: 0 });
  });

  it('a throwing transport marks the row failed (single attempt, no retry)', async () => {
    await notifyFamily(db, {
      studentId: 2, eventType: 'schedule_change', subjectType: 'class', subjectId: 'c2', payload: {}
    });
    const res = await runEmailDelivery(db, undefined, {
      send: async () => { throw new Error('provider down'); }
    });
    expect(res).toEqual({ sent: 0, failed: 1 });
    const rows = await emailRows();
    expect(rows.filter(r => r.status === 'failed')).toHaveLength(1);
    // failed rows are not re-picked
    const again = await runEmailDelivery(db, undefined, { send: async () => {} });
    expect(again).toEqual({ sent: 0, failed: 0 });
  });

  it('without a key and without an injected transport it no-ops and rows stay queued', async () => {
    await notifyFamily(db, {
      studentId: 2, eventType: 'schedule_change', subjectType: 'class', subjectId: 'c3', payload: {}
    });
    const res = await runEmailDelivery(db);
    expect(res.skipped).toBe(true);
    const rows = await emailRows();
    expect(rows.filter(r => r.status === 'queued')).toHaveLength(1);
  });
});

describe('renderEmail', () => {
  it('bespoke template uses concrete payload fields; unknown events fall back readable', () => {
    const b = renderEmail('booking_accepted', { starts_at: '2026-08-01T17:00:00.000Z', room: 'A' });
    expect(b.subject).toBe('Booking confirmed');
    expect(b.text).toContain('2026-08-01 17:00 UTC');
    const g = renderEmail('join_request_approved', { class_name: 'Algebra' });
    expect(g.subject).toContain('join request approved');
    expect(g.text).toContain('Algebra');
  });
});
