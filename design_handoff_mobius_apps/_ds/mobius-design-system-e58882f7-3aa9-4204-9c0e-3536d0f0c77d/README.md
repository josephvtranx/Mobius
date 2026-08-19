## Mobius design conventions

Mobius is a teal-on-ink LMS design language: **Poppins** type, white cards on soft washed backgrounds, quiet borders. Style with the global CSS classes below (shipped in this bundle's stylesheet closure) plus sparing inline styles for one-off layout glue — there is no utility-class system and no CSS-in-JS.

**Setup**: components need no provider. `Modal` portals into `document.getElementById('modal-root')` — ensure a `<div id="modal-root"></div>` exists in the document (create it once at app root) or Modal renders nothing.

**Palette (hex, use directly in inline styles):** ink `#16303a` · primary teal `#2e9d8d` (hover `#268578`) · brand accent `#63b3a6` · muted text `#64827e` · card border `#e3eeec` · page wash `#f4f9f8` · error `#9c3a31` on `#fdf1ef` · warning `#9c6a1d` on `#fff4e0`.

**Class vocabulary (defined in the shipped CSS — use these, don't invent):**
- Layout: `hm-page` (max-width column), `hm-grid` (2-col card grid), `hm-stack`, `hm-actions`
- Cards: `hm-card`, `hm-card-head` (title row), `hm-card-foot`; KPI tiles: `hm-kpis` > `hm-kpi` > `hm-kpi-value` + `hm-kpi-label` (`hm-kpi alert` for warning tint)
- Lists: `hm-list` (bordered rows), `hm-sessions` > `hm-session` (+ `today` modifier), `hm-session-when/-day/-time/-what/-subject/-meta`
- Controls: `hm-btn` (secondary), `hm-btn primary` (teal), `hm-link` (quiet teal link), `hm-badge warn`
- States: `hm-empty`, `hm-error`, `hm-loading`, `hm-warn-note`
- Auth/forms: `login-saas-input-group` > `login-saas-input-label` + `login-saas-input`, `login-saas-signin-btn`, `login-saas-error`, `login-saas-divider`
- Icons: Font Awesome 6 classes (`<i className="fa-solid fa-calendar" />`) — the FA styles + fonts ship in this bundle.

**Read before styling:** `styles.css` (imports `fonts/fonts.css` + `_ds_bundle.css` — all component and design-language rules live there) and each component's `.prompt.md`/`.d.ts`.

**Idiomatic composition:**
```jsx
<div className="hm-page">
  <section className="hm-card">
    <div className="hm-card-head"><h2>Upcoming sessions</h2><a className="hm-link">View all</a></div>
    <ul className="hm-sessions">
      <li className="hm-session today">
        <div className="hm-session-when"><span className="hm-session-day">Today</span>
        <span className="hm-session-time">4:00 – 5:00 PM</span></div>
        <div className="hm-session-what"><span className="hm-session-subject">Algebra</span>
        <span className="hm-session-meta">Group · 6 enrolled</span></div>
      </li>
    </ul>
    <div className="hm-card-foot"><button className="hm-btn primary">Book a session</button></div>
  </section>
</div>
```

# Mobius (mobius-client@1.0.0)

This design system is the published mobius-client React library, bundled as a single
browser global. All 5 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.Mobius`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.Mobius.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { ActionButtons } = window.Mobius;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<ActionButtons />);
```

## Tokens

10 CSS custom properties from mobius-client. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (2): `--mobius-text-darker-grey`, `--mobius-text-grey`
- **typography** (3): `--fa-font-brands`, `--fa-font-regular`, `--fa-font-solid`
- **other** (5): `--fa-animation-direction`, `--fa`, `--fa-style-family-brands`, …

## Components

### general
- `ActionButtons`
- `CalendarWidget`
- `Modal`
- `SearchableDropdown`
- `SummaryCard`
