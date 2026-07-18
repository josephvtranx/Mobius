// The multi-tenant job scheduler (spec 08 cadences), started ONLY from
// index.js under an env guard — app.js and the test harness never see timers.
// Each tick iterates active institutions from the registry and runs the
// group's jobs against each tenant pool; per-tenant/per-job failures are
// logged and contained (never fatal, never cross-tenant). runGroup is exported
// so tests can drive a tick directly without any timer.
import { runEmailDelivery } from './emailJobs.js';
import { runHoldExpiry, runRequestDeadlines, runBookingDeadlines, runSessionGenerator } from './scheduleJobs.js';
import { runAutoComplete, runLowBalanceScan, runRecordLock, runPriceSync } from './billingJobs.js';
import { runNotesReminder } from './academicJobs.js';

export const JOB_GROUPS = {
  minute:     { intervalMs: 60_000,     jobs: { runHoldExpiry } },
  fiveMinute: { intervalMs: 300_000,    jobs: { runRequestDeadlines, runBookingDeadlines, runEmailDelivery } },
  hourly:     { intervalMs: 3_600_000,  jobs: { runAutoComplete, runNotesReminder } },
  daily:      { intervalMs: 86_400_000, jobs: { runLowBalanceScan, runRecordLock, runPriceSync, runSessionGenerator } }
};

export async function runGroup(name, { registryPool, getTenantPool, logger = console }) {
  const group = JOB_GROUPS[name];
  const { rows: tenants } = await registryPool.query(
    `SELECT code FROM institutions WHERE is_active`);
  const results = [];
  for (const { code } of tenants) {
    let pool;
    try {
      pool = await getTenantPool(code);
    } catch (err) {
      logger.error(`[jobs:${name}] ${code}: tenant pool unavailable — ${err.message}`);
      continue;
    }
    for (const [jobName, job] of Object.entries(group.jobs)) {
      try {
        const summary = await job(pool);
        results.push({ tenant: code, job: jobName, ...summary });
      } catch (err) {
        logger.error(`[jobs:${name}] ${code}/${jobName} failed — ${err.message}`);
      }
    }
  }
  return results;
}

export function startScheduler(deps) {
  const logger = deps.logger ?? console;
  const timers = [];
  for (const name of Object.keys(JOB_GROUPS)) {
    let running = false; // re-entry guard: a slow tick never stacks
    const tick = async () => {
      if (running) return;
      running = true;
      try {
        await runGroup(name, deps);
      } catch (err) {
        logger.error(`[jobs:${name}] tick failed — ${err.message}`);
      } finally {
        running = false;
      }
    };
    timers.push(setInterval(tick, JOB_GROUPS[name].intervalMs));
  }
  logger.log(`⏱  Job scheduler started (${Object.keys(JOB_GROUPS).join(', ')})`);
  return { stop: () => timers.forEach(clearInterval) };
}
