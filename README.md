# @danifo/ui

Shared look, feel and app shell for the danifo.dev dashboards (finance,
workout, flights, watch, jobs): a Bootstrap 5.3 base theme and the React
pieces the apps had each written for themselves.

- `scss/_base.scss`: fonts, light and dark palettes, radii, drawer width. An app sets `$primary` and imports this in place of Bootstrap.
- `AppShell`: the header (brand on the left, linking home; actions and the hamburger on the right) and the navigation, as a drawer, a sidebar from `lg`, or a phone tab bar.
- `PageHeader`, `Eyebrow`, `Panel`, `Kpis` / `Kpi`, `DataTable`, `Foot`, `CenterState`, `DeltaBadge`, `BarRow`, `num`: page chrome.
- `configureTheme`, `initTheme`, `ThemeToggle`: system / light / dark, stored per app, applied as `data-bs-theme`.
- `usd`, `usd0`, `usdRange`: money formatting. A range is joined so it cannot wrap at the dash.

## Install

Pin a release. The tarball attached to each GitHub Release is prebuilt:

```bash
npm i https://github.com/mdanifo/danifo-ui/releases/download/v0.3.1/danifo-ui-0.3.1.tgz
```

The git tag works too, but then `prepare` runs `vite build` on each install
of the app, with this repo's devDependencies along for the ride (Playwright
alone is about 19 MB):

```bash
npm i github:mdanifo/danifo-ui#v0.3.1
```

Do not point an app at `#main`: a library change would then ship with the
app's next unrelated deploy. Move an app to a new version in its own commit.
`react`, `react-dom`, `react-bootstrap` and `bootstrap` are peer
dependencies; the app brings its own.

## Theme

```scss
// src/theme.scss
$primary: #1c7c54;
@import "@danifo/ui/scss/base";
```

Every variable in the base is `!default`, so anything set before the import
wins. In the entry file, before the first render:

```js
import { configureTheme, initTheme } from "@danifo/ui";

configureTheme({ storageKey: "finance:theme" }); // one key per app
initTheme(); // paints the stored choice, then follows the OS while it is "system"
```

`<ThemeToggle />` is a small select for `headerActions`.

## AppShell

```jsx
import { AppShell, ThemeToggle } from "@danifo/ui";

// Hash router or plain links: homeHref is enough.
<AppShell
  brand="Finance"
  homeHref="#budget/planner"
  routeKey={section}
  renderNav={(close) =>
    LINKS.map((l) => (
      <a key={l.href} href={l.href} className="nav-link" onClick={close}>{l.label}</a>
    ))}
  headerActions={<ThemeToggle />}
>
  {page}
</AppShell>
```

The props that matter:

- `brand`, `brandSub` (default `danifo.dev`), `brandImage` (a URL, `{ src, alt, width, height }`, or an element).
- `homeHref`: the brand is a link home at any width. Do not render it as plain text. `brandAriaLabel` replaces the default accessible name, `${brand} home` (say, `"Finance, danifo.dev, home"`).
- `renderBrandLink`: for react-router. It receives `{ className, children, href, "aria-label" }`; return a `NavLink` built from them.
- `renderNav(close)`: the links for all pages. Call `close` when one is chosen.
- `routeKey`: the drawer closes when it changes (back button, deep link).
- `layout`: `"drawer"` (default) or `"sidebar"`, a permanent 220px left column from `lg` and the same drawer below it.
- `renderTabs`: a phone bottom tab bar for the pages used daily. The shell adds a **More** tab that opens the drawer, and pads the page so nothing ends under the bar. `moreLabel` renames it.
- `headerActions`: rendered before the hamburger.

The drawer opens from the right, 280px wide, and closes on a choice, Escape,
a click outside, its close button and a route change. Opening moves focus
onto it; closing hands focus back to whichever button opened it.

```jsx
// react-router, sidebar on desktop, tab bar on phones
<AppShell
  brand="Workout"
  homeHref="/schedules"
  layout="sidebar"
  renderBrandLink={({ className, children, href, "aria-label": label }) => (
    <NavLink to={href} className={className} aria-label={label}>{children}</NavLink>
  )}
  renderTabs={() =>
    TABS.map((t) => (
      <NavLink key={t.to} to={t.to} className="dui-tab">
        <span className="dui-tab-icon" aria-hidden="true">{t.icon}</span>
        <span className="dui-tab-label">{t.label}</span>
      </NavLink>
    ))}
  renderNav={(close) => /* all pages */}
/>
```

## Develop

```bash
npm ci
npm test               # unit and component tests (Vitest, jsdom)
npm run test:coverage  # the same, failing under 100% on src/
npm run test:e2e       # Playwright against the demo, Chromium at 390px and 1280px (once: npx playwright install chromium)
npm run demo           # the demo app at http://localhost:5173
npm run build
npm run check:scss     # the base theme compiles with the sass CLI, as an app imports it
npm run check:pack     # the package ships dist/ and scss/ and nothing from src/, demo/ or e2e/
npm run check:consumer # the packed tarball imports and its SCSS compiles from a scratch app
```

`demo/` renders each layout and component on the real theme. The e2e suite
runs against it and holds the things that have broken before: the drawer
starts closed at any width and its hidden links cannot take focus; nothing
scrolls sideways at 390px (tables scroll inside `.table-responsive`); the
brand goes home; light is white and dark follows the OS until a choice is
made; a money range, and a KPI figure inside a `Panel`, stay on one line.
CI runs all of it on each push and pull request.

## Release

Bump `version`, tag `vX.Y.Z` and push the tag. The Release workflow checks
the tag against `package.json`, runs the tests, builds, and publishes a
GitHub Release with the packed tarball attached. Then bump each app.
