-- Up Migration
-- Baseline: registry schema verbatim (was src/config/regestryschema.sql —
-- deleted in MODERNIZATION 5.4). institutions + user_directory.

-- =====================================================================
-- Mobius Registry Schema — v2
-- One global DB mapping institution code → tenant database.
-- Design doc: docs/schema-v2.md §Registry
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE institutions (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- case-insensitive lookup ('uw123' == 'UW123'); constrained format
  code           CITEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Za-z0-9_-]{3,32}$'),
  name           TEXT NOT NULL,
  -- D10 (MODERNIZATION.md): full PG URL to the tenant DB, plaintext accepted
  -- pre-launch. Revisit (pgcrypto or vault-injected credentials) before
  -- production tenants exist.
  conn_string    TEXT NOT NULL,
  logo_url       TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,  -- suspend a tenant without deleting it
  schema_version TEXT,                           -- tenant DB migration version (Phase 5.4 tooling)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Global login directory: email + password hash + institution. Login
-- authenticates AGAINST THE REGISTRY (the tenant users row is the profile);
-- the PK makes emails globally unique across institutions going forward.
-- Written on signup/guardian creation; hash kept in sync by change-password.
CREATE TABLE user_directory (
  email         CITEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  code          CITEXT NOT NULL REFERENCES institutions(code),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_directory_code ON user_directory (code);

-- Down Migration
-- (baseline: no down)
