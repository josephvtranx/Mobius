// The global login directory (registry DB): email → password hash +
// institution code. The registry is the AUTH SOURCE — login verifies here and
// then loads the tenant users row as the profile. Tenant password hashes are
// kept in sync (signup/change-password write both) so legacy header-based
// login keeps working for rows created before the directory existed.
import { registryPool } from './registryPool.js';

export async function directoryLookup(email) {
  const { rows } = await registryPool.query(
    `SELECT email, password_hash, code FROM user_directory WHERE email = $1`, [email]);
  return rows[0] ?? null;
}

// INSERT — a 23505 here means the email is taken somewhere globally; callers
// surface the same "Email already registered" shape as the tenant check.
export async function directoryRegister(email, passwordHash, code) {
  await registryPool.query(
    `INSERT INTO user_directory (email, password_hash, code) VALUES ($1, $2, $3)`,
    [email, passwordHash, code]);
}

// 0 rows updated = a legacy user with no directory row — fine.
export async function directoryUpdatePassword(email, passwordHash) {
  const { rowCount } = await registryPool.query(
    `UPDATE user_directory SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2`,
    [passwordHash, email]);
  return rowCount;
}

// Best-effort rollback cleanup when a tenant transaction aborts after a
// directory insert (cross-DB writes aren't atomic; a crash between the two
// can still orphan a row — accepted pre-launch).
export async function directoryRemove(email) {
  await registryPool.query(`DELETE FROM user_directory WHERE email = $1`, [email]).catch(() => {});
}
