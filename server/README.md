# mobius-backend

Express + PostgreSQL API for Mobius LMS. Run `npm run dev` here (or `npm run dev:server` from the repo root). No build step; tests are `npm test` (PGlite-backed, no external database needed).

## Configuration

Copy `.env.example` to `.env` and fill in real values. **Never commit `.env` or paste real credentials into this file** — an earlier revision of this README leaked live secrets into git history, which forced a credential rotation.

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5001) |
| `NODE_ENV` | `development` / `production` / `test` |
| `REGISTRY_URL` | Postgres URL of the **registry DB** (institutions + user_directory). The only DB URL the server needs — each tenant's URL comes from the registry's `conn_string` column. |
| `JWT_SECRET` | Signs access tokens (and refresh tokens unless `REFRESH_TOKEN_SECRET` is set). Generate: `openssl rand -hex 64` |
| `CORS_ORIGIN` | Extra allowed origin (dev defaults already include the Vite ports) |
| `RESEND_API_KEY` | Resend email key. **Leave empty in dev/test** — email sending is skipped without it. |
| `RESEND_FROM` | From-address for outbound email (default `Mobius <onboarding@resend.dev>`) |
| `ADMIN_EMAIL` | Recipient for institution-registration requests |
| `PGSSLMODE` | Set `disable` only for local PGlite targets; otherwise SSL is on |

Migrations: `npm run migrate` applies `migrations/registry/` to the registry, then `migrations/tenant/` to every tenant (see `docs/adr/0002-migrations-node-pg-migrate.md`).
