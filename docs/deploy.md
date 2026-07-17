# Deployment & environments

> MODERNIZATION 0.7. The Render service is configured via the dashboard, not the repo —
> this file is the in-repo record of that config. Update it when the dashboard changes.

## Production

- **Host:** Render — service `mobius-t071` (`mobius-t071.onrender.com`), custom domain `mobiusteach.com` (+ `www`).
- **Build command:** `npm run build` (installs server+client deps, builds the client to `client/dist`).
- **Start command:** `npm start` → `server/index.js`; the server serves `client/dist` and the SPA catch-all.
- **Proxy:** `app.set('trust proxy', 1)`; session cookies are `secure` in production only.
- **Databases:** PostgreSQL on Azure. Two kinds:
  - Registry DB → env `REGISTRY_URL` (institutions table: code → tenant `conn_string`).
  - One tenant DB per institution, reached via the registry's `conn_string` (SSL with `rejectUnauthorized: false`).
- **Env vars set on Render (names only — values live in the dashboard, never in git):**
  `NODE_ENV=production`, `REGISTRY_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET` (optional — falls back to `JWT_SECRET`), `SESSION_SECRET`, `RESEND_API_KEY`, `CORS_ORIGIN` (optional extra origin).
- **Note:** `DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_NAME`/`DB_SSL` feed only the dead legacy pool (`src/config/db.js`) and can be removed once Phase 1 deletes it.

## Tests / CI

- `npm test` (root or `server/`) runs vitest; the harness boots **PGlite** (in-process Postgres/WASM)
  over TCP via `pglite-socket`, loads the real `schema.sql` + `regestryschema.sql`, and points the
  real pg pools at it (`PGSSLMODE=disable`). No docker, no external DB, works identically in CI.
- GitHub Actions: `.github/workflows/ci.yml` — install → client build → server tests → lint (non-blocking until Phase 4.5).

## Staging — TODO (decision needed)

There is no staging environment yet. Recommended shape when needed:
- A second Render service (`mobius-staging`) off a `staging` branch, `NODE_ENV=production`.
- One dedicated staging tenant DB + a staging registry (or a staging row in the prod registry with a
  clearly non-production code, e.g. `STAGE1`) — never point staging at a production tenant DB.
- Schema v2 is greenfield: provision staging DBs from `server/src/config/schema.sql` / `regestryschema.sql`.

## Known runtime risk (Phase 5.2/5.3)

`express-session` uses the in-memory `MemoryStore`: tenant sessions are lost on every deploy/restart
and are not shared across instances — do not scale the Render service horizontally until D7 (tenant
code moves into the JWT) or a persistent session store lands.
