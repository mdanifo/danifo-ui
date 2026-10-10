# @danifo/ui

The shared look, feel and shell for the danifo.dev dashboards
(finance / workout / flights / watch / jobs): one Bootstrap 5.3 base theme and
the React pieces the apps were duplicating.

| | |
|---|---|
| `scss/_base.scss` | The base theme: fonts, palette (light + dark), radii, drawer width. An app sets its accent (`$primary`) and imports this instead of Bootstrap. |
| `AppShell` | Brand (name and/or logo) on the left is **always a link home**; hamburger on the right opens a drawer from the right. Closes on a choice, Escape, outside click, close button, and route changes; opening moves focus onto the drawer and closing hands it back to the opener. `layout="sidebar"` makes the drawer a permanent left column from `lg`; `renderTabs` adds a phone bottom tab bar with a built-in **More** that opens the drawer (v0.3.0). |
| `PageHeader`, `Eyebrow`, `Panel`, `Kpis`/`Kpi`, `DataTable`, `Foot`, `CenterState`, `DeltaBadge`, `BarRow`, `num` | Common page chrome. |
| `configureTheme` / `initTheme` / `ThemeToggle` | System / light / dark, stored per app, resolved to `data-bs-theme`. |
| `usd`, `usd0`, `usdRange` | Money formatting; ranges never wrap at the dash. |

## Use it from an app

```bash
# The build attached to the GitHub Release: nothing to compile on install.
npm i https://github.com/mdanifo/danifo-ui/releases/download/v0.3.1/danifo-ui-0.3.1.tgz

# Or straight from the tag: the `prepare` script runs `vite build` on install,
# which means installing this repo's devDependencies too.
npm i github:mdanifo/danifo-ui#v0.3.1
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
npm test               # unit + component tests (Vitest, jsdom)
npm run test:coverage  # the same, failing under 100% on src/
npm run test:e2e       # Playwright, in Chromium at 390px and 1280px (once: npx playwright install chromium)
npm run demo           # the demo app behind the e2e suite, at http://localhost:5173
npm run build
npm run check:scss     # the base theme compiles with the sass CLI, the way an app imports it
npm run check:pack     # the package ships dist/ and scss/, nothing else
npm run check:consumer # the packed tarball imports and its SCSS compiles, as an app would use it
```

`demo/` renders every layout and component on the real theme; the e2e suite
checks the behaviour in `docs/HANDOFF.md` that must survive (closed drawer,
nothing scrolling sideways at 390px, home links, both themes, money that does
not wrap) in a real browser. CI runs all of the above on every push and pull
request.

Release: bump `version`, tag `vX.Y.Z`, push the tag. The Release workflow
checks the tag against `package.json`, tests, builds, and publishes a GitHub
Release with the packed tarball. Apps move by changing the version in their
dependency. Never point an app at `#main`.

The plan for moving dashboards onto this is in `docs/HANDOFF.md`.
