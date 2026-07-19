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
