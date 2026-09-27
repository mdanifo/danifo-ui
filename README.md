# @danifo/ui

The shared look, feel and shell for the danifo.dev dashboards
(finance.danifo.dev, workout.danifo.dev, and the Bootstrap apps that follow):
one Bootstrap 5.3 base theme and the React pieces the apps were duplicating.

| | |
|---|---|
| `scss/_base.scss` | The base theme: fonts, palette (light + dark), radii, drawer width. An app sets its accent (`$primary`) and imports this instead of Bootstrap. |
| `AppShell` | Header with the hamburger at the upper left; every section in one drawer, hidden until opened, at every width. Closes on a choice, Escape, a click outside, its close button, and route changes. Router-agnostic. |
| `PageHeader`, `Eyebrow`, `Panel`, `Kpis`/`Kpi`, `DataTable`, `Foot`, `CenterState`, `DeltaBadge`, `BarRow`, `num` | Common page chrome shared by the finance dashboard (and available to the others). |
| `configureTheme` / `initTheme` / `ThemeToggle` | System / light / dark, stored per app, resolved to `data-bs-theme`. Offer the toggle where you want it; omit it to leave system as the only mode. |
| `usd`, `usd0`, `usdRange` | Money formatting; ranges never wrap at the dash. |

## Use it from an app

```bash
npm i github:mdanifo/danifo-ui#v0.2.1   # built on install by the `prepare` script
# or, from a sibling checkout under ~/code:
# npm i file:../../danifo-ui
```

```scss
// src/theme.scss
$primary: #1c7c54;
@import "@danifo/ui/scss/base";
```

```jsx
import {
  AppShell,
  ThemeToggle,
  configureTheme,
  initTheme,
  PageHeader,
  Panel,
} from "@danifo/ui";

configureTheme({ storageKey: "finance:theme" });
initTheme();

<AppShell
  brand="Finance"
  homeHref="#budget/planner"
  routeKey={section}
  renderNav={(close) => SECTIONS.map((s) => (
    <a key={s.id} className="nav-link" href={`#${s.id}`} onClick={close}>{s.label}</a>
  ))}
  headerActions={<><ThemeToggle /><Badge>…</Badge></>}
>
  {page}
</AppShell>
```

## Develop

```bash
npm ci
npm test          # vitest + Testing Library
npm run build     # dist/index.js
```

Release: bump `version`, tag `vX.Y.Z`, push the tag; apps move by changing the
`#vX.Y.Z` in their dependency. Never point an app at `#main`.

The plan for moving dashboards onto this is in `docs/HANDOFF.md`.
