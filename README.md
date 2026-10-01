# @danifo/ui

The shared look, feel and shell for the danifo.dev dashboards
(finance / workout / flights / watch / jobs): one Bootstrap 5.3 base theme and
the React pieces the apps were duplicating.

| | |
|---|---|
| `scss/_base.scss` | The base theme: fonts, palette (light + dark), radii, drawer width. An app sets its accent (`$primary`) and imports this instead of Bootstrap. |
| `AppShell` | Brand (name and/or logo) on the left is **always a link home**; hamburger on the right opens a drawer from the right. Closes on a choice, Escape, outside click, close button, and route changes. `layout="sidebar"` makes the drawer a permanent left column from `lg`; `renderTabs` adds a phone bottom tab bar with a built-in **More** that opens the drawer (v0.3.0). |
| `PageHeader`, `Eyebrow`, `Panel`, `Kpis`/`Kpi`, `DataTable`, `Foot`, `CenterState`, `DeltaBadge`, `BarRow`, `num` | Common page chrome. |
| `configureTheme` / `initTheme` / `ThemeToggle` | System / light / dark, stored per app, resolved to `data-bs-theme`. |
| `usd`, `usd0`, `usdRange` | Money formatting; ranges never wrap at the dash. |

## Use it from an app

```bash
npm i github:mdanifo/danifo-ui#v0.3.0   # built on install by the `prepare` script
```

```scss
// src/theme.scss
$primary: #1c7c54;
@import "@danifo/ui/scss/base";
```

```jsx
import { AppShell, ThemeToggle, configureTheme, initTheme } from "@danifo/ui";

configureTheme({ storageKey: "finance:theme" });
initTheme();

// Hash router (or plain links): homeHref is enough.
<AppShell
  brand="Finance"
  brandAriaLabel="Finance, danifo.dev — home"  // optional; default `${brand} home`
  brandImage="/logo.svg"                       // optional logo beside the wordmark
  homeHref="#budget/planner"
  routeKey={section}
  renderNav={(close) => /* … */}
  headerActions={<ThemeToggle />}
>
  {page}
</AppShell>

// Sidebar on desktop, drawer on phones, plus a bottom tab bar for the pages
// used every day. The tab bar's More button opens the same drawer.
<AppShell
  brand="Workout"
  layout="sidebar"
  renderTabs={() =>
    TABS.map((t) => (
      <NavLink key={t.to} to={t.to} className="dui-tab">
        <span className="dui-tab-icon" aria-hidden="true">{t.icon}</span>
        <span className="dui-tab-label">{t.label}</span>
      </NavLink>
    ))}
  renderNav={(close) => /* every page, in the drawer / sidebar */}
/>

// react-router: wrap with NavLink via renderBrandLink (use the given href).
<AppShell
  brand="Workout"
  homeHref="/schedules"
  renderBrandLink={({ className, children, href, "aria-label": label }) => (
    <NavLink to={href} className={className} aria-label={label}>{children}</NavLink>
  )}
  renderNav={(close) => /* … */}
/>
```

## Develop

```bash
npm ci
npm test
npm run build
```

Release: bump `version`, tag `vX.Y.Z`, push the tag; apps move by changing the
`#vX.Y.Z` in their dependency. Never point an app at `#main`.

The plan for moving dashboards onto this is in `docs/HANDOFF.md`.
