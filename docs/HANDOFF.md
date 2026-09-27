# Handoff: move the danifo.dev dashboards onto @danifo/ui (for Cursor)

**Status (2026-09-27):** `@danifo/ui` **v0.2.2** is public
(https://github.com/mdanifo/danifo-ui). Finance, workout, flights, watch, and
jobs all depend on `github:mdanifo/danifo-ui#v0.2.2` and share `AppShell` + the
Bootstrap base. The hamburger and drawer sit on the **right** (content is
left-justified). Read `README.md` first.

## Where things stand

| | Repo | Path | Ships by |
|---|---|---|---|
| This library | `mdanifo/danifo-ui` (public) | `~/code/danifo-ui` | tag `vX.Y.Z` |
| Finance | `mdanifo/personal-finance-tracker` | `frontend/` | push to `main` → CI → auto-deploy |
| Workout | `mdanifo/workout-tracker` | `dashboard/frontend/` | PR → `dashboard-ci.yml` → merge → `dashboard-deploy.yml` |
| Flights | `mdanifo/flight-price-alerter` | `frontend/` | on `@danifo/ui` |
| Watch | `mdanifo/watch-suggestions` | `frontend/` | on `@danifo/ui` |
| Jobs | `mdanifo/open-job-aggregator` | `frontend/` | on `@danifo/ui` |

All five UIs are React + Vite + Bootstrap 5.3 via this library. Navigation is
the shared hamburger drawer (`AppShell`), opening from the right, hidden by
default at every width.

**In v0.2.2**

- `scss/_base.scss` / `scss/_shell.scss`
- `AppShell` (hamburger + `offcanvas-end` on the right), page chrome,
  `ThemeToggle` / `configureTheme` / `initTheme`, `usd` / `usd0` / `usdRange`

## Behaviour that must survive (each broke once)

- The menu is hidden by default at every width. The hamburger sits at the upper
  right. The drawer closes on a choice, Escape, a click outside, its close
  button, and navigation. A closed drawer's links cannot take focus.
- Nothing scrolls sideways at 390px. Tables scroll inside `.table-responsive`.
- Finance's home page is Budget (`#budget/planner`); workout's is `/schedules`;
  flights' is `#american`; watch's is `/`; jobs' is `/overview`.
- Both themes ship; light is white; dark follows the system unless chosen.
- Money is monospace and right-aligned; ranges don't wrap at the dash.

## Releasing

Bump `version`, tag `vX.Y.Z` and push the tag, then move each app's dependency
to the new tag in its own commit or PR. Never point an app at `#main`: a library
change would then ship to production on the next unrelated deploy.
