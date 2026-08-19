// The global login directory (registry DB): email → password hash +
// institution code. The registry is the AUTH SOURCE — login verifies here and
// then loads the tenant users row as the profile. Tenant password hashes are
// kept in sync (signup/change-password write both) so legacy header-based
// login keeps working for rows created before the directory existed.
import { registryPool } from './registryPool.js';

export async function directoryLookup(email) {
  const { rows } = await registryPool.query(
    `SELECT d.email, d.password_hash, d.code, i.name AS institution_name,
            i.is_active AS institution_active
       FROM user_directory d JOIN institutions i ON i.code = d.code
      WHERE d.email = $1`, [email]);
  return rows[0] ?? null;
}

// Display name of an institution (for login payloads on the legacy
// header-based path, where no directory row exists). Best-effort.
export async function institutionNameFor(code) {
  if (!code) return null;
  const { rows } = await registryPool.query(
    `SELECT name FROM institutions WHERE code = $1`, [code]).catch(() => ({ rows: [] }));
  return rows[0]?.name ?? null;
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
