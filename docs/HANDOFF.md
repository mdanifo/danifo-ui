# Handoff: move the danifo.dev dashboards onto @danifo/ui (for Cursor)

**Owner decision (2026-09-27):** one shared UI library for every danifo.dev
page. This repo is set up (v0.2.0). Finance and workout are on the library
locally via `file:` deps; tag a release and switch CI to
`github:mdanifo/danifo-ui#v0.2.0` once private-repo access is decided. Read
`README.md` first.

## Where things stand

| | Repo | Path | Ships by |
|---|---|---|---|
| This library | `mdanifo/danifo-ui` (private) | `~/code/danifo-ui` | tag `vX.Y.Z` |
| Finance | `mdanifo/personal-finance-tracker` | `frontend/` | push to `main` → CI → auto-deploy |
| Workout | `mdanifo/workout-tracker` | `dashboard/frontend/` | PR → `dashboard-ci.yml` → merge → `dashboard-deploy.yml` |
| Flights | `mdanifo/flight-price-alerter` | `frontend/` | custom CSS + bottom nav today — not on Bootstrap yet |
| Watch | `mdanifo/watch-suggestions` | `frontend/` | custom CSS + bottom nav today — not on Bootstrap yet |

Finance and workout are React 19 + Vite + Bootstrap 5.3 (react-bootstrap) and
share `AppShell` from this library. Flight and watch still use a custom token
sheet and a bottom nav; adopt Bootstrap + this library in a later pass.

**In v0.2.0**

- `scss/_base.scss`: the base theme, with every variable `!default`. It covers
  fonts, the light and dark palette, radii and the 280px drawer.
- `scss/_shell.scss`: the shell rules Bootstrap has no utility for.
- `AppShell`: the hamburger and drawer, router-agnostic via `renderNav(close)`
  and `renderBrandLink`, closing on route change via `routeKey`. It keeps the
  exact ids and classes both apps' tests select on: `#primary-nav`,
  `.primary-nav`, `.menu-button`, `.nav-link`, `.app-header`, `.app-main`, and
  the "Open menu" / "Close menu" / "Close" labels.
- `PageHeader`, `Eyebrow`, `Panel`, `Kpis` / `Kpi`, `DataTable`, `Foot`,
  `CenterState`, `DeltaBadge`, `BarRow`, `num`, `toneClass`.
- `configureTheme` / `initTheme` / `ThemeToggle` (system / light / dark, stored
  per app, resolved to `data-bs-theme`).
- `usd`, `usd0`, `usdRange`.

## Decide first: private repo access

The repo is **private**, and both apps install it with `npm ci` in GitHub
Actions (the workout dashboard also builds a Docker image). A private git
dependency needs credentials there. Pick one before cutting the tagged release
apps pin in CI:

1. **Make the repo public (recommended).** It holds a theme and UI code, with
   no secrets or data, and it removes every CI and Docker auth problem.
2. Keep it private and give each app's workflows read access: a fine-grained
   PAT (read-only, this repo only) stored as an Actions secret, plus
   `git config --global url."https://x-access-token:${TOKEN}@github.com/".insteadOf "https://github.com/"`
   before `npm ci`. Also pass it into the workout Docker build as a build
   secret, never as an ARG baked into a layer.

Ask the owner which. Do not make the repo public without that answer.

Local checkouts under `~/code` use `file:../../danifo-ui` (finance) /
`file:../../../danifo-ui` (workout) so `npm ci` works without GitHub auth.

## Done (v0.2.0 + app wiring)

### Library v0.2.0

Extracted the shared chrome and theme from finance / workout. Each extracted
component has a Vitest test. Version is `0.2.0`.

### Finance onto the library

- Depends on `@danifo/ui` (`file:` locally).
- `src/theme.scss`: finance variables, then `@import "@danifo/ui/scss/base"`.
- `App.jsx` `Shell` → `AppShell` (brand "Finance 💚", home `#budget/planner`).
- `src/ui.jsx` deleted; imports come from `@danifo/ui`.
- ThemeToggle not shown (off by default); `configureTheme` + `initTheme` still
  run so system preference paints `data-bs-theme`.

### Workout onto the library

- Same dependency. `theme.scss` keeps `$primary` and chart/series variables,
  then imports the base. `custom.css` rules pinned by contract tests stay.
- `Shell.jsx` → `AppShell` with react-router `NavLink`s; ThemeToggle + athlete
  chip as `headerActions`.
- Contract tests assert shell/theme behaviour against the library files where
  the rules moved.

## Still to do

- Decide public vs private (above), tag `v0.2.0`, switch app deps from `file:`
  to `github:mdanifo/danifo-ui#v0.2.0`.
- Verify finance with `pytest tests/browser -q` (never finance.danifo.dev),
  `pytest -q`, and `ruff check`.
- Ship workout as a PR with screenshots.
- Later: move flight and watch onto Bootstrap + this library (they still use a
  custom CSS shell today).

## Behaviour that must survive (each broke once)

- The menu is hidden by default at every width. The hamburger sits at the upper
  left. The drawer closes on a choice, Escape, a click outside, its close
  button, and navigation. A closed drawer's links cannot take focus.
- Nothing scrolls sideways at 390px. Tables scroll inside `.table-responsive`.
- Finance's home page is Budget (`#budget/planner`); workout's is `/schedules`.
- Both themes ship; light is white; dark follows the system unless chosen.
- Money is monospace and right-aligned; ranges don't wrap at the dash.

## Releasing

Bump `version`, tag `vX.Y.Z` and push the tag, then move each app's dependency
to the new tag in its own commit or PR. Never point an app at `#main`: a library
change would then ship to production on the next unrelated deploy.
