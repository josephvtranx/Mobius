-- Platform admins: Mobius employees who operate ABOVE any single tenant.
-- Unlike student/staff/instructor/guardian (which live inside a tenant DB and
-- are scoped to req.db), platform admins authenticate against the REGISTRY and
-- can provision/configure tenants and read cross-tenant aggregates. Their JWT
-- carries no tenantCode — see authenticatePlatformAdmin.
CREATE TABLE platform_admins (
  admin_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT   NOT NULL,
  name          TEXT   NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Down Migration
DROP TABLE IF EXISTS platform_admins;
