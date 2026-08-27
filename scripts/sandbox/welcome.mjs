import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function sourceVersion(root) {
  const hash = createHash('sha256');
  async function walk(relative) {
    const entries = await readdir(path.join(root,relative), { withFileTypes: true });
    for (const entry of entries.sort((a,b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
      const file = path.join(relative,entry.name);
      if (entry.isDirectory()) await walk(file);
      else { hash.update(file); hash.update(await readFile(path.join(root,file))); }
    }
  }
  for (const dir of ['client/src','client/scripts','server/src','server/scripts/dev','server/migrations','scripts/sandbox']) await walk(dir);
  for (const file of ['package-lock.json','server/package-lock.json','client/package-lock.json','index.js','server/test/helpers/testEnv.js']) hash.update(await readFile(path.join(root,file)));
  return hash.digest('hex').slice(0,12);
}

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
export function resetSessionScript(runId) {
  return `try { if (localStorage.getItem('mobiusSandboxRun') !== ${JSON.stringify(runId)}) {
    for (const key of ['token','refreshToken','user','institutionCode','adminToken','admin']) localStorage.removeItem(key);
    localStorage.setItem('mobiusSandboxRun', ${JSON.stringify(runId)});
  } } catch { /* App will explain if browser storage is unavailable. */ }`;
}

export function welcomeHtml(meta) {
  const scenarios = meta.scenarios;
  const sessionLink = value => `/operations/classes/${value.classId}/sessions/${value.sessionId}/attendance`;
  const cards = [
    ['Attendance & credits', 'Staff / instructor', 'Open yesterday’s Sandbox Practice session. Mark Alice present and Ben absent, save, reload, then inspect their wallet histories. Saving again must not deduct twice.', sessionLink(scenarios.attendance)],
    ['Complete the missing note', 'Instructor → guardian', 'Open the Sandbox Practice session from two days ago: Alice has a note; Ben does not. Add Ben’s note and check Reports. As Grace, confirm Alice’s record is visible and unrelated children are not.', sessionLink(scenarios.notes)],
    ['Verify automatic attendance', 'Staff', 'A practice session has an automatic mark awaiting review. Inspect the session and resolve its verification task. Check task history.', '/operations/tasks'],
    ['Join, waitlist & enrollment', 'Staff → family', 'Charlie has a pending join request; Alice has a waitlist request for a full Sandbox Practice class. Approve Charlie; do not overfill the full class. Check membership and family schedules.', '/operations/requests'],
    ['Reschedule a private lesson', 'Instructor → adult student', 'Charlie’s private lesson in three days has a pending proposal for the following day. Accept or reject in the instructor inbox. Check that exactly one occurrence remains and no credits move.', '/inbox'],
    ['Booking & cancellation', 'Student → instructor', 'Alice has a pending Sandbox Practice booking in five days. Respond as Kim. Try another booking from the family catalog. Cancel Alice’s practice session in seven days and verify the deadline explanation and balance.', '/catalog'],
    ['Low balance & packages', 'Staff → student', 'Ben starts with 3 credits. Record a Standard package payment: expect +105 credits (100 + 5 bonus). A money-only payment must grant none. Check the payment, wallet and notification views.', '/operations/wallets'],
    ['Messages & notifications', 'Instructor → student / guardian', 'Kim has an unread question from Alice. Reply, then check Alice’s Messages. Grace can read her child’s conversation without posting as Alice. Open the bell and check read/unread behavior.', '/messages'],
    ['Profile photo', 'Every role', 'Upload a PNG/JPEG/GIF, crop, save and reload. Check profile and sidebar. Try an unsupported or oversized file, then remove the photo. Never use a real private photo.', '/profile'],
  ];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mobius · Testing sandbox</title><script>${resetSessionScript(meta.runId)}</script>
<style>
:root{font-family:system-ui,sans-serif;color:#30261f;background:#fcfaf7;line-height:1.6}*{box-sizing:border-box}body{margin:0}main{max-width:1100px;margin:auto;padding:36px 24px 72px}h1{font-size:clamp(30px,5vw,46px);line-height:1.15;letter-spacing:-1.5px;margin:12px 0}h2{font-size:24px;margin-top:36px}h3{margin:0 0 8px;font-size:18px}p{margin:8px 0 16px}.eyebrow{color:#98602c;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:2px}.notice{background:#fff0d9;border-left:4px solid #cc772b;padding:16px 20px;border-radius:8px;margin:24px 0}.meta{color:#6f6258;font-size:13px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.card{background:white;border:1px solid #e5ddd4;border-radius:14px;padding:22px;overflow-wrap:anywhere}a{color:#97511e;text-underline-offset:3px}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #d37a29;outline-offset:4px}code{font-size:14px;background:#f3efea;padding:2px 5px;border-radius:4px}.button{display:inline-block;background:#87491f;color:white;border-radius:8px;padding:10px 18px;text-decoration:none;font-weight:600;margin:8px 8px 8px 0}label{display:flex;gap:10px;margin:12px 0;align-items:start}input{margin-top:6px;flex-shrink:0}details{background:#fff;border:1px solid #e5ddd4;border-radius:12px;padding:18px;margin:16px 0}summary{cursor:pointer;font-weight:650}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4efe8;padding:16px;border-radius:8px;font-size:13px}footer{margin-top:36px;border-top:1px solid #ddd;padding-top:16px}@media(max-width:500px){main{padding:24px 16px}.grid{grid-template-columns:1fr}}
</style></head><body><main>
<div class="eyebrow">Mobius / local testing</div><h1>Your practice academy is ready.</h1>
<p>Explore the real app with synthetic data. Everything runs on this Mac, separately from your teammates and production.</p>
<div class="notice"><strong>Changes disappear when you close the launcher.</strong><br>Keep its Terminal window open. To reset, close it and double-click Start Mobius.command again. Save screenshots and bug reports outside the app before stopping.</div>
<p class="meta">Version ${escape(meta.version)} · Launch ${escape(meta.launchedAt)} · Academy TEST01 · Timezone America/Los_Angeles<br>${meta.counts.students} students · ${meta.counts.instructors} instructors · realistic history + named practice scenarios</p>
<a class="button" href="/auth/login">Open Mobius login</a><a href="#scenarios">Choose a test scenario</a>
<h2>Choose a role</h2><p>Password for all demo accounts: <code>Password123!</code>. Sign out before switching roles, or use a separate browser profile. An additional tab shares the same login.</p>
<div class="grid">${meta.accounts.map(a => `<article class="card"><div class="eyebrow">${escape(a.role)}</div><h3>${escape(a.name)}</h3><p><code>${escape(a.email)}</code></p><a href="${a.path || '/auth/login'}">${a.path ? 'Platform admin login' : 'Sign in through normal login'} →</a></article>`).join('')}</div>
<h2 id="scenarios">Start with a complete workflow</h2><p>Sign in with the indicated role first. Links to staff session reviews require staff access; Kim can find the same sessions through My classes / Feedback. Follow the scenario, then reload and confirm the result.</p>
<div class="grid">${cards.map(([title,role,body,href]) => `<article class="card"><div class="meta">${escape(role)}</div><h3>${escape(title)}</h3><p>${escape(body)}</p><a href="${href}">Open relevant page →</a></article>`).join('')}</div>
<h2>Test the rest of the app</h2>
<details><summary>Staff checklist</summary><p>Run each action, reload, and confirm the result from the other affected role.</p>${['Dashboard and Reports: counts agree with source lists; filters and drill-downs work.','Roster: search, create student, add guardian, edit details, verify linked records.','Classes: create group/private class, assign room/instructor, enroll and remove a student; try a full class and a conflicting time.','Scheduling: navigate dates, compare calendars and confirm cancellations/reschedules.','Attendance and notes: saving, correction, lock/unlock requests, credits and missing-note counts.','Task inbox: filters, resolve/dismiss, confirmation, history and empty search.','Finance: packages create/edit/retire, manual payments, wallet adjustments, income/cost filters, payroll and invoices where available.','Settings and profile: distinguish read-only institution settings from editable profile fields.'].map(t=>`<label><input type="checkbox">${t}</label>`).join('')}</details>
<details><summary>Instructor checklist</summary>${['Availability: add/change/remove windows; verify bookable times and conflicts.','My classes: roster, dates, session attendance, notes and feedback edits.','Inbox: accept/reject pending booking and Charlie’s reschedule; inspect the resulting schedule.','Messages, announcements, notification read state, payroll/pay history and profile.','Authorization: other instructors’ private classes and staff finances must remain restricted.'].map(t=>`<label><input type="checkbox">${t}</label>`).join('')}</details>
<details><summary>Student and guardian checklist</summary>${['Alice: schedule, catalog, booking, join/leave request, cancellation and own academic records.','Ben: low balance booking gate; after staff top-up, retry and compare balance.','Charlie: adult purchasing permissions and private lesson reschedule.','Grace: child switching/linked records, Alice’s schedule, payments and guardian messaging oversight.','Verify unrelated students’ records and staff pages are inaccessible.'].map(t=>`<label><input type="checkbox">${t}</label>`).join('')}</details>
<details><summary>Platform admin checklist</summary><p>Use the separate admin login. Create a temporary academy, inspect settings/activation and financial views. Provisioned academies use local PGlite and also disappear on shutdown. Never enter real database URLs or credentials.</p></details>
<details><summary>UI/UX checks on every page</summary>${['Try a narrow window and desktop width; look for clipped text, overlapping controls and horizontal scrolling.','Use Tab, Shift+Tab, Enter and Escape. Check focus visibility, labels and modal closing.','Submit empty/invalid fields; confirm useful errors and preservation of entered data.','Check loading, no results, populated and error states. Reload after saving; navigate back and forward.','Try repeated clicks on Save; confirm no duplicate operations.','Note confusing wording, duplicate titles, unclear actions and unexpected navigation.'].map(t=>`<label><input type="checkbox">${t}</label>`).join('')}</details>
<details><summary>Known limits — not test failures</summary><p>Real email and scheduled jobs are disabled. In-app events still work. Deadline/automatic-job states are pre-seeded; waiting will not run background jobs. Payments record money already received; there is no payment processor or family checkout. Password reset/account invitation flows are incomplete. PGlite is for feature testing, not production load/concurrency verification. This checklist is coverage to perform, not a claim that every feature is complete.</p></details>
<h2>Report something that feels wrong</h2><p>Copy this template into your team’s usual chat or issue tracker. Attach a screenshot; use synthetic data only.</p>
<pre>Title:
Version: ${escape(meta.version)}
Role / demo email:
Scenario / page URL:
Mac / browser / window size:
Steps to reproduce:
Expected result:
Actual result:
Screenshot:
Does it happen again after a fresh launch?</pre>
<footer class="meta">Closing this browser tab does not stop the sandbox. Stop it from the launcher Terminal window. Checklist ticks are temporary. Use this welcome page again at /__sandbox/.</footer>
</main></body></html>`;
}
