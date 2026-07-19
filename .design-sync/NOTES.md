# design-sync notes — Mobius

- **App repo, not a packaged DS**: no dist, no Storybook, no TS. The bundle builds from `client/src/ds-entry.js` (`cfg.entry`) — a hand-authored export list of the 5 presentational components. Adding a component to the sync = add its export there + a `componentSrcMap` pin + a preview.
- **CSS pipeline**: `cfg.buildCmd` concatenates `.design-sync/css-head.css` + vendored font css + the design-language stylesheets (index/home/login/FinancialDashboard.css) into gitignored `client/src/css/.ds-sync-entry.css` (= `cfg.cssEntry`). Run buildCmd before every converter run. Remote `@import`s DON'T work from cssEntry (appended mid-file — browsers ignore them); that's why fonts are vendored.
- **Fonts are self-hosted**: Poppins/Inter woff2 subsets + FA 6.7.2 webfonts live in `client/src/webfonts/`; `ds-fonts.css`/`ds-fa.css` in `client/src/css/` carry the @font-face + FA classes with `../webfonts/` urls that extractFonts rewrites into `fonts/`. The app itself still uses the CDNs — these copies exist for the sync.
- **Modal needs `#modal-root`**: previews create it at module top; the conventions header tells the design agent to provide it. Modal styling (.modal-overlay/.modal) baseline lives in `.design-sync/css-head.css` (the app's own modal styles are scattered in legacy page css).
- **SummaryCard chrome** comes from `FinancialDashboard.css` — keep it in the buildCmd concat even though the finance pages are parked.
- **Render check browser**: no ms-playwright cache on this machine — pass `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` to package-validate/package-capture/resync.

## Known render warns
- `[RENDER_THIN] Modal` — "rendered height 0px": fixed-position portal overlay; the screenshot proves it renders fully. Benign.
- SearchableDropdown `Disabled` cell renders identical to `Default` when closed — the component applies no visual disabled state. True render, graded good with note.

## Re-sync risks
- `client/src/css/.ds-sync-entry.css` is generated — a re-sync that skips `cfg.buildCmd` builds against a stale concat (or fails if a fresh clone never generated it). Always run buildCmd first.
- The design language is mid-redesign (docs/client-ui-plan.md): as the shared UI kit lands (Button/Card/Badge/EmptyState), those components should join ds-entry.js and hm-* class docs in conventions.md may need updating.
- Vendored fonts duplicate what the app pulls from CDNs — if the app's font stack changes (Poppins → something else), re-vendor.
- FA css is v6.7.2 pinned — bump `client/src/css/ds-fa.css` + webfonts together with the app's CDN version.
