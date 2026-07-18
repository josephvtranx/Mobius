// Email delivery for the notification service (spec 08 channels; GRD-5
// per-guardian opt-in). notifyFamily queues channel='email' rows for
// guardians whose notification_prefs.email === true; this job drains the
// queue oldest-first. Single attempt: a throw marks the row 'failed' and it
// stays visible for ops — no retry storm against a broken provider. Without
// RESEND_API_KEY (and no injected send) the job no-ops and rows stay queued.
import { DateTime } from 'luxon';
import { sendEmail, emailEnabled } from '../email/transport.js';

const BATCH = 50;

const when = (iso) => (iso ? `${String(iso).replace('T', ' ').slice(0, 16)} UTC` : '');

// Spec 08: every family-facing message carries the concrete object — the
// payloads written at the domain sites hold those fields. Events without a
// bespoke template fall back to a readable generic rendering.
const TEMPLATES = {
  wallet_credited: (p) => ({
    subject: 'Credits added to your wallet',
    text: `${p.delta ?? ''} credits were added. New balance: ${p.balance ?? 'see your wallet'}.`
  }),
  low_balance: (p) => ({
    subject: 'Low credit balance',
    text: `The wallet is running low (balance ${p.balance ?? '?'}, about ${p.runway_sessions ?? '?'} sessions left). Top up to keep sessions running.`
  }),
  balance_negative: (p) => ({
    subject: 'Action needed: negative credit balance',
    text: `The wallet balance is negative (${p.balance ?? '?'}). Please top up — sessions may be blocked until the balance is restored.`
  }),
  price_change: (p) => ({
    subject: 'Upcoming price change',
    text: `The per-session price changes from ${p.old_cost ?? '?'} to ${p.new_cost ?? '?'} credits, effective ${when(p.effective_at) || 'soon'}. Future sessions only.`
  }),
  booking_accepted: (p) => ({
    subject: 'Booking confirmed',
    text: `Your session on ${when(p.starts_at)} is confirmed${p.room ? ` (room ${p.room})` : ''}.`
  }),
  booking_rejected: (p) => ({
    subject: 'Booking not available',
    text: `The instructor couldn't take the requested slot${p.reason ? ` (${p.reason})` : ''}. Please pick another time.`
  }),
  reschedule_accepted: (p) => ({
    subject: 'Reschedule confirmed',
    text: `Your session moved from ${when(p.from)} to ${when(p.to)}${p.room ? ` (room ${p.room})` : ''}.`
  }),
  reschedule_rejected: (p) => ({
    subject: 'Reschedule declined',
    text: `The requested move was declined${p.reason ? ` (${p.reason})` : ''}. The original session stands.`
  }),
  reschedule_expired: (p) => ({
    subject: 'Reschedule request expired',
    text: `The reschedule request expired unanswered. The original session on ${when(p.original_starts_at)} stands.`
  }),
  session_cancelled_by_instructor: (p) => ({
    subject: 'Session cancelled by the instructor',
    text: `The session on ${when(p.starts_at)} was cancelled by the instructor. No credits were charged.`
  })
};

const label = (eventType) => String(eventType).replace(/_/g, ' ');

export function renderEmail(eventType, payload = {}) {
  const t = TEMPLATES[eventType];
  if (t) return t(payload);
  const details = Object.entries(payload)
    .filter(([, v]) => v !== null && typeof v !== 'object')
    .map(([k, v]) => `${label(k)}: ${v}`)
    .join('\n');
  return {
    subject: `Mobius update: ${label(eventType)}`,
    text: details || `You have a new ${label(eventType)} notification.`
  };
}

export async function runEmailDelivery(db, now = DateTime.utc().toISO(), { send } = {}) {
  const deliver = send ?? (emailEnabled() ? sendEmail : null);
  if (!deliver) return { sent: 0, failed: 0, skipped: true };

  const { rows } = await db.query(
    `SELECT n.notification_id, n.event_type, n.payload, u.email
       FROM notification_log n
       JOIN users u ON u.user_id = n.recipient_user_id
      WHERE n.channel = 'email' AND n.status = 'queued'
      ORDER BY n.created_at
      LIMIT ${BATCH}`);

  let sent = 0, failed = 0;
  for (const row of rows) {
    const { subject, text } = renderEmail(row.event_type, row.payload ?? {});
    try {
      await deliver({ to: row.email, subject, text });
      await db.query(
        `UPDATE notification_log SET status = 'sent', sent_at = $2 WHERE notification_id = $1`,
        [row.notification_id, now]);
      sent++;
    } catch {
      await db.query(
        `UPDATE notification_log SET status = 'failed' WHERE notification_id = $1`,
        [row.notification_id]);
      failed++;
    }
  }
  return { sent, failed };
}
