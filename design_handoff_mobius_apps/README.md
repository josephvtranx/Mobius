# Handoff: Möbius Multi-Tenant LMS — All Role Apps

## Overview
Möbius is a multi-tenant LMS for tutoring academies. Each academy is a fully isolated tenant with its own database. This bundle contains the complete design reference for **all user-facing surfaces**:

1. **Landing splash** → **Login** (shared tenant entry)
2. **Student app** (teal) — schedule, reschedule requests, catalog, messages, feedback
3. **Instructor app** (indigo) — teaching schedule, attendance, session notes
4. **Staff app** (orange) — enrollment, scheduling, roster, requests, finance/payroll
5. **Guardian app** (plum) — per-child schedule/progress/wallet, payments, requests
6. **Platform Admin console** (light neutral/ink) — the surface Möbius *employees* use to run the platform itself: provision academies, per-academy config, cross-tenant finance

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code. The task is to **recreate these designs in the target codebase's existing environment** (e.g. the existing mobius-client React app) using its established patterns, components, and API layer. The prototypes' embedded seed data and simulated latency stand in for real endpoints.

Each `.dc.html` file opens directly in a browser. The `<x-dc>` template holds the markup; the `<script data-dc-script>` class holds all state/interaction logic (plain React-style class, `renderVals()` feeds the template).

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, and interaction states are final and should be recreated faithfully. All apps share the Mobius design system (mobius-client) conventions.

## Universal Design Tokens
- **Font**: 'Noto Sans KR' 400/500/600/700 (Google Fonts) everywhere — chosen for mixed Korean/Latin content (student names like 김민준, ₩/$ amounts). Admin console additionally uses 'IBM Plex Mono' 400/500/600 for codes, money, and axis labels.
- **Icons**: Font Awesome 6 Free (ships with the design-system bundle).
- **Shared shape scale**: cards 14–18px radius, buttons 9–12px, chips/pills 999px; 1px quiet borders; soft washed page backgrounds with white cards.

### Per-app accent palettes
- **Student**: ink `#16303a`, teal `#2e9d8d` (hover `#268578`), wash `#f4f9f8`, border `#e3eeec`, muted `#64827e`
- **Instructor**: same ink/wash family with indigo accent `#5b6bc0`
- **Staff**: header `#FFAB45`, nav `#FFC06E`, light buttons `#ffe0b7`, white content bg
- **Guardian**: plum rail `#843f63`, accents `#9c4f78`, warning amber `#e0a83e`
- **Admin console**: page `#faf9f7`, sidebar `#f3f2ee`, ink `#1c1c1c`, muted `#8a8577`, faint `#b3aea4`, border `#e5e3de`, hairline `#f0eee8`, success `#1f8a4c` on `#effaf2`, error `#b23a2f` on `#fdf1ef`, warning `#9c6a1d` on `#fff8ea`
- **Status colors (all apps)**: confirmed = app accent, awaiting = amber `#e0a83e`/`#9c6a1d`, error/suspended = red family, past = grey

## Screens / Views

### Mobius Landing.dc.html
Splash: möbius wordmark centered on a soft multi-tone radial wash (teal/peach/lavender). Any click or keypress navigates to the login. Breathing "Press any key or click to continue" hint at bottom.

### Mobius Login.dc.html
Pale blue (`#e8f4f6`) page, unified header+background. White card (1080px grid: 440px form / 520px illustration). Email + password (show/hide toggle), underlined "Forgot password?", teal sign-in button, "or" divider, two arrow links (register with institution code / request workspace). Demo routing: `staff@mobius.demo` + `Password123!` → Staff app; password `mobius` → Student app; wrong creds show inline error. Right panel is an image slot with a bundled illustration.

### Mobius Student.dc.html
Sidebar (250px, labeled icons, grouped Learn / Stay in touch) + topbar. Views: Home (greeting hero merged with up-next card and inline stat bar), My schedule (weekly calendar grid with status legend), My classes (enrolled-class cards with progress), Class catalog, Messages (two-pane inbox + compose), Feedback (tutor notes with ratings/tags), Settings. Reschedule flow: session detail modal → instructor-suggested slots → confirm → "request sent" state. Students never book; they request.

### Mobius Instructor.dc.html
Same shell in indigo. Teaching schedule, attendance marking (tap-per-student, drives payroll hours), session notes, messages.

### Mobius Staff.dc.html
Orange operations app. Home dashboard, Roster (students/instructors with expandable rows, add-student), Classes (create wizard, detail with roster/schedule/price), Requests (approve/reject queue), Schedule search (search any student/instructor to see their week; AM/PM toggle), Finance (dashboard + payroll tab), New-student enrollment wizard (4 fixed-size steps: info → subject+availability grid → smart-match instructor → package/payment), add-subject flow for existing students.

### Mobius Guardian.dc.html
Plum rail app for parents. Overview (per-child cards: wallet, next sessions, low-balance flags — wallets never pooled), My kids section (Schedule, Progress & feedback, Requests, Payments with pending badge), Inbox. Wallet/billing follows the v2 guardian model (guardian is a login; one primary guardian per student; notification prefs per child).

### Mobius Admin Login.dc.html
Dark (`#0f1420`/`#182031`) minimal internal login: eyebrow "MOBIUS · PLATFORM ADMIN" over "Console", email+password, inline errors ("Email and password are required." / "Invalid email or password"), expired-session notice pattern (120-min token, no refresh). Any filled creds sign in (demo).

### Mobius Admin.dc.html — Platform Admin console
Light neutral theme. Sidebar: brand card, Main menu (Dashboard, Academies), Management (Provision academy), admin profile card w/ logout. Topbar: breadcrumb + search.

- **Dashboard**: 3 stat tiles (Total collected / This month / Active students — all derived from the academies seed, never restated) with mini bar sparklines and footer deltas; **Revenue trend**: smooth bezier line + gradient area (SVG), HTML-overlay labels (SVG `<text>` with dynamic content doesn't render in this templating — keep labels as absolutely-positioned HTML), month window derived from today's date, ◀ ▶ arrows pan 6-month windows back to Sep 2025, dashed grey segment + "in progress" for the current month only, hover tooltips with per-academy breakdown, multi-select academy dropdown (checkbox menu; selections sum into one curve; unreachable academies footnoted, suspended noted, zero-revenue shows empty state).
- **Academies**: table of 9 seed academies (healthy → fresh → schema-behind → suspended → unreachable shapes); columns: code+logo initials, name (+unreachable warning/Retry), students, classes, collected, this month, schema chip (current/behind/unknown), Configure. Suspended rows dimmed w/ red tag, excluded from finance sums. Inline config editor below the table: 15 business-rule knobs grouped (Booking & scheduling / Attendance & records / Billing & balances / Payments-dormant), humane labels + one-line descriptions, dormant "not yet active" tags, per-knob history line, local draft ("edited" chips, "Save N changes" → "Saved."), suspend/reactivate with destructive confirm bar, unreachable state with retry.
- **Provision academy** (own page): full-width form card — institution code (3–32 chars, `[A-Za-z0-9_-]`, unique), academy name, first staff name/email (globally unique)/password (min 8). Submit disabled until filled (visually + `aria-disabled`), honest "Provisioning…" busy state (~2s, double-submit warned), success banner "Provisioned {CODE} — first staff {email} can now log in" + "View in academies" link; new academy prepends to the table.

## Interactions & Behavior
- All list/detail views include loading-skeleton, error (+Retry), and empty treatments; server messages surface verbatim.
- Currency: `—` em-dash for unknown/unreachable, never `$0`.
- Derive, don't restate: counts = list lengths; per-row finance joined by code; chart scale = max of window.
- `prefers-reduced-motion` honored in the admin console.
- Modals portal into `#modal-root` (present at each app root).

## State Management
Each prototype's logic class documents the needed state shape: view routing, draft-based config edits (only changed keys PATCHed), optimistic-but-honest saves (refetch after success), reschedule/request lifecycles (pending → confirmed/rejected), wallet math per student.

## Assets
- `image-slot.js` — drag-and-drop image placeholder web component used by the login/landing pages
- `login-illustration.png` — current login panel illustration
- Design system: mobius-client bundle (`_ds/`), Font Awesome 6, Google Fonts (Noto Sans KR, IBM Plex Mono)

## Files
- `Mobius Landing.dc.html`, `Mobius Login.dc.html` — entry flow
- `Mobius Student.dc.html`, `Mobius Instructor.dc.html`, `Mobius Staff.dc.html`, `Mobius Guardian.dc.html` — tenant apps
- `Mobius Admin Login.dc.html`, `Mobius Admin.dc.html` — platform layer
- `auth/` — student auth flow pages (sign in / signup / verify / reset / welcome)
- `_ds/` — Mobius design-system bundle (styles + components)
