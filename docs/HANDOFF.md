# Handoff: move the danifo.dev dashboards onto @danifo/ui (for Cursor)

**Owner decision (2026-09-27):** one shared UI library for every danifo.dev
page. This repo is set up (v0.1.0). The work left is to finish extracting the
shared pieces and move both dashboards onto it. Read `README.md` first.

## Where things stand

| | Repo | Path | Ships by |
|---|---|---|---|
| This library | `mdanifo/danifo-ui` (private) | `~/code/danifo-ui` | tag `vX.Y.Z` |
| Finance | `mdanifo/personal-finance-tracker` | `frontend/` | push to `main` → CI → auto-deploy |
| Workout | `mdanifo/workout-tracker` | `dashboard/frontend/` | PR → `dashboard-ci.yml` → merge → `dashboard-deploy.yml` |

Both dashboards are React 19 + Vite + Bootstrap 5.3 (react-bootstrap in
finance). As of 2026-09-27 both use the same shell: a header with the hamburger
at the upper left, and one offcanvas drawer hidden by default at every width.
Each app has its own copy of that code, which is the duplication this library
removes.

**Already in v0.1.0**

- `scss/_base.scss`: the base theme, with every variable `!default`. It covers
  fonts, the light and dark palette, radii and the 280px drawer.
- `scss/_shell.scss`: the shell rules Bootstrap has no utility for.
- `AppShell`: the hamburger and drawer, router-agnostic via `renderNav(close)`
  and `renderBrandLink`, closing on route change via `routeKey`. It keeps the
  exact ids and classes both apps' tests select on: `#primary-nav`,
  `.primary-nav`, `.menu-button`, `.nav-link`, `.app-header`, `.app-main`, and
  the "Open menu" / "Close menu" / "Close" labels.
- `usd`, `usd0`, `usdRange`.

## Decide first: private repo access

The repo is **private**, and both apps install it with `npm ci` in GitHub
Actions (the workout dashboard also builds a Docker image). A private git
dependency needs credentials there. Pick one before migrating anything:

1. **Make the repo public (recommended).** It holds a theme and UI code, with
   no secrets or data, and it removes every CI and Docker auth problem.
2. Keep it private and give each app's workflows read access: a fine-grained
   PAT (read-only, this repo only) stored as an Actions secret, plus
   `git config --global url."https://x-access-token:${TOKEN}@github.com/".insteadOf "https://github.com/"`
   before `npm ci`. Also pass it into the workout Docker build as a build
   secret, never as an ARG baked into a layer.

Ask the owner which. Do not make the repo public without that answer.

## Work to do

### 1. Library v0.2.0: extract what both apps duplicate

From finance `frontend/src/ui.jsx`:

- `PageHeader`, `Eyebrow`, `Panel`, `Kpis` / `Kpi`, `DataTable`, `Foot`
- `CenterState`, `DeltaBadge`, `BarRow`, and the `num` class string

From workout `dashboard/frontend/src`:

- `theme.js` + `ThemeToggle.jsx` (system / light / dark, stored per app,
  resolved to `data-bs-theme`). Finance has no toggle today; offer it
  there, off by default.

Keep app-specific things in the apps: finance's budget status colours and
markers, the charts, workout's day tiles and log weight boxes. Add a test for
each extracted component. Release `v0.2.0`.

### 2. Finance onto the library

- `npm i github:mdanifo/danifo-ui#v0.2.0`.
- `src/theme.scss`: keep only finance's variables (`$primary`/`$success`
  `#1c7c54`, `$danger` `#b6502f`, `$secondary` `#2e4756`, Newsreader headings,
  Source Code Pro mono), then `@import "@danifo/ui/scss/base"`. Keep the
  finance-only rules (status select colours, `.tax-total`, chart variables)
  after it.
- `App.jsx` `Shell`: replace with `AppShell` (brand "Finance 💚", home
  `#budget/planner`, `routeKey={section}`, month picker and provider badge as
  `headerActions`). Budget stays the home page.
- Replace `src/ui.jsx` imports with `@danifo/ui`; delete what moved.
- Verify with `npm run build`, `pytest tests/browser -q` (Playwright against the
  fake server, **never** finance.danifo.dev), then `pytest -q` and
  `ruff check pfrs tests poc scripts`.

### 3. Workout onto the library

- Same dependency. `src/styles/theme.scss`: keep `$primary #2563eb` and workout's
  chart and series variables, then import the base. Keep `custom.css` rules
  pinned by `global.contract.test.js` and `logLoads.test.js`.
- `components/Shell.jsx` → `AppShell`, with react-router `NavLink`s in
  `renderNav` (call `close` on click) and `renderBrandLink` returning a
  `NavLink` to `/schedules`. Use `routeKey={location.pathname}`. Keep the
  ThemeToggle and athlete chip as `headerActions`.
- `npm test` (Vitest) and `npm run build` must pass. Update the contract tests
  that read `theme.scss` / `Shell.jsx` so they assert the same things against
  the library's files or the rendered DOM.
- Ship as a PR with screenshots.

### 4. Tidy up

Once both apps depend on the library:

- delete the duplicated shell and helpers from each app;
- add one line to each app's docs pointing here;
- note the library in finance `CLAUDE.md` (Commands section).

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
