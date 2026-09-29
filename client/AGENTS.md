# Client guidance

Applies to `client/`; also follow the root `AGENTS.md`.

## Structure

- React 18 and Vite, with JSX components. Entry points are `src/main.jsx` and `src/App.jsx`.
- Pages live in `src/pages/`, reusable components in `src/components/`, styles in `src/css/`, and API wrappers in `src/services/`.
- Keep navigation consistent with `src/config/shellNav.js`, the header, sidebar, and routes.
- Follow existing page and style conventions; reuse components and visual tokens before adding alternatives.

## API and time contracts

- Use the shared Axios instance in `src/services/api.js` through service modules. Preserve bearer-token injection and the coalesced refresh/retry behavior.
- Pre-auth tenant-scoped calls use `X-Institution-Code`; authenticated tenant selection comes from the JWT on the server.
- Handle the API's `{ message, errors: [{ field, message }] }` error shape and provide loading, empty, and error states.
- Import UTC helpers from `mobius-lms`; use `src/lib/timeDisplay.js` for existing display helpers. API timestamps must end in `Z`.
- Keep server secrets out of client code and `VITE_*` variables, which are exposed to the browser.

## Local development and verification

- Confirm the API target is local before browser testing: `src/services/api.js` can fall back to the deployed API.
- The Vite proxy is enabled only with `VITE_USE_PROXY=true`; its default backend is `http://localhost:5001`. Coordinate this with the API module's configuration.
- From the root: `npm run dev:client` starts Vite; `npm --prefix client run build` builds without reinstalling dependencies.
- Run root `npm run lint`. The separate client flat config imports plugins not all declared in `client/package.json`; do not assume a client lint script exists.
- No client test script is currently defined. For UI changes, build and verify affected flows in the browser against local/test data when available; state any verification gaps.

## Feature map and current work

- Staff: classes, scheduling, attendance, membership requests, rosters, task inbox, wallets, finance/packages, payroll, and reports under `src/pages/operations/`.
- Instructor: availability, classes, feedback, inbox, and pay under `src/pages/instructor/`; family schedules, catalog/booking, records, billing, requests, and guardian portal under `src/pages/family/`.
- Platform-admin pages under `src/pages/admin/` use their own login/service flow. Do not merge platform admin with tenant staff.
- `src/pages/operations/roster/NewStudentModal.jsx` creates account details and optionally links a guardian; enrollment and payment are separate workflows. `src/pages/operations/classes/AddSubjectModal.jsx` handles group/waitlist and private matching/enrollment. `onboardingService.js` supports these paths.
- Student creation and guardian linking are separate requests. A failed second step can leave a created student; do not blindly retry the entire flow. Account creation does not currently provide a complete invitation/password-setup experience.
- Packages and Payments are staff manual-recording screens, not checkout. Keep recorded money, wallet credits, and invoices conceptually distinct.
- `EnrollmentWizard.jsx` still contains older Top-Up parking language; do not treat it as proof that staff package sales are absent, or silently choose a family-checkout policy.
- The financial overview computes aggregates over fetched lists and labels payroll-only costs. Verify pagination/completeness before presenting totals as comprehensive.
- Password reset remains a placeholder. Task inbox, notification bell, availability editor, and lazy route splitting already exist—check code before following an old “build missing feature” checklist.
- Reuse `tokens.css`, `shell.css`, `roster.css`, `my-classes.css`, shared modal/components, and existing visual helpers. Treat handoff bundles as design references, not application source.
- 2026-08-26 baseline: build passes, no browser sweep performed. Root lint includes application Date violations and many imported-bundle violations; see `../docs/PROJECT_STATUS_2026-08-26.md` for exact results and priorities.
