// Resend transport. The API key comes from RESEND_API_KEY at call time —
// never hardcoded (this file previously embedded a live key in source; that
// key is committed history and must be rotated). Without a key, every send
// is a skip: dev/test/sandbox can never send real email by accident.
import { Resend } from 'resend';

let client; // lazy: dotenv may run after this module is evaluated
function resend() {
  if (process.env.MOBIUS_SANDBOX === '1') return null;
  if (client === undefined) {
    client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }
  return client;
}

export const emailEnabled = () => Boolean(resend());

export async function sendEmail({ to, subject, text, html }) {
  const r = resend();
  if (!r) return { skipped: true };
  return r.emails.send({
    from: process.env.RESEND_FROM || 'Mobius <onboarding@resend.dev>',
    to, subject, text, html
  });
}
