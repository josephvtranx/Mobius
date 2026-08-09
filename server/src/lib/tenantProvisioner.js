// Tenant DB provisioning seam. Creating a physical database is environment-
// specific: in the sandbox/tests it's a fresh in-memory PGlite instance; in
// production it's a real CREATE DATABASE on the Azure Postgres server (or a
// pre-created DB whose conn string you register). Rather than branch on
// NODE_ENV inside src, the environment INJECTS its implementation via
// setTenantProvisioner — the sandbox/test harness registers the PGlite one.
//
// A provisioner takes { code, name } and returns a fully-migrated tenant DB's
// connection string. The caller (adminRoutes) then registers it in the
// registry and seeds the initial staff account.
let impl = null;

export function setTenantProvisioner(fn) {
  impl = fn;
}

export function hasTenantProvisioner() {
  return typeof impl === 'function';
}

export async function provisionTenantDb({ code, name }) {
  if (impl) return impl({ code, name });
  // Production path is intentionally not wired yet (per the "prototype in the
  // sandbox first" decision): automated Azure DB creation needs a base admin
  // connection with createdb privilege + the migration runner, which is an
  // infra decision. Fail loudly rather than pretend.
  throw new Error(
    'Tenant provisioning is not configured for this environment. ' +
    'Register a PGlite provisioner (sandbox/test) or wire the Azure ' +
    'CREATE DATABASE + migrate path before provisioning in production.');
}
