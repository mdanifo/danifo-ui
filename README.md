# @danifo/ui

Shared look, feel and app shell for the danifo.dev dashboards (finance,
workout, flights, watch, jobs): a Bootstrap 5.3 base theme and the React
pieces the apps had each written for themselves.

- `scss/_base.scss`: fonts, light and dark palettes, radii, drawer width, chart tokens. An app sets `$primary` and imports this in place of Bootstrap.
- `scss/_fonts.scss`: DM Sans and IBM Plex Mono served from the app's own origin, with metric-matched fallbacks. Opt in.
- `AppShell`: the header (brand on the left, linking home; actions and the hamburger on the right) and the navigation, as a drawer, a sidebar from `lg`, or a phone tab bar.
- `PageHeader`, `Eyebrow`, `Panel`, `PanelHeading`, `Kpis` / `Kpi`, `DataTable`, `Foot`, `CenterState`, `Skeleton`, `DeltaBadge`, `BarRow`, `num`: page chrome.
- `configureTheme`, `initTheme`, `ThemeToggle`: system / light / dark, stored per app, applied as `data-bs-theme`.
- `usd`, `usd0`, `usdRange`: money formatting. A range is joined so it cannot wrap at the dash.
- `--dui-series-1` to `-6`, `--dui-chart-grid`, `-axis`, `-ink`, `-surface`: chart colours per theme.

## Install

Pin a release. The tarball attached to each GitHub Release is prebuilt:

```bash
npm i https://github.com/mdanifo/danifo-ui/releases/download/v0.4.2/danifo-ui-0.4.2.tgz
```

The git tag works too, but then `prepare` runs `vite build` on each install
of the app, with this repo's devDependencies along for the ride (Playwright
alone is about 19 MB):

```bash
npm i github:mdanifo/danifo-ui#v0.4.2
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

### Fonts

The base names DM Sans and IBM Plex Mono but loads nothing. To serve them from
the app's own origin, import the fonts partial after the base and remove the
Google Fonts `<link>`:

```scss
@import "@danifo/ui/scss/base";
@import "@danifo/ui/scss/fonts";
```

Vite copies the woff2 files out of the package and fingerprints them. Until
they arrive the text is set in Arial (or Liberation Sans) scaled to DM Sans's
metrics, so the swap moves nothing. The files and their licence are described
in `fonts/README.md`.

### Charts

The base defines six series colours per theme, `--dui-series-1` to
`--dui-series-6`, validated together for colour-vision deficiency and contrast
on the base surfaces, plus `--dui-chart-grid`, `--dui-chart-axis`,
`--dui-chart-ink` and `--dui-chart-surface`, which follow Bootstrap's tokens.
Assign slots in order and never cycle them; a seventh series folds into
"Other". Slots 3 to 5 are below 3:1 on the light surface, so a chart that uses
them also shows direct labels or a table. Good and bad wear Bootstrap's
success and danger, never a series slot. For an app's own paired tokens,
`light-dark()` works: the base sets `color-scheme` for both themes.

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
onto it and makes the page and tab bar `inert`, so Tab stays in the menu and
the page neither scrolls nor takes a click; closing undoes that and hands
focus back to whichever button opened it. The header and tab bar pad for the
safe-area insets, so an installed app with `viewport-fit=cover` keeps its
header out from under the status bar.

A link marked `.active` or `aria-current="page"` (react-router's `NavLink`
does both) is drawn on the primary's subtle background in both themes. A
`.dui-nav-icon` span before the label, with a letter, a symbol or an SVG,
gives it a small framed glyph:

```jsx
<a href="#budget" className="nav-link" onClick={close}>
  <span className="dui-nav-icon" aria-hidden="true">B</span>
  Budget
</a>
```

## KPIs

`Kpis` is a grid that fits as many tiles as it is wide, measured against
itself rather than the viewport, each at least `min` wide (default `9rem`).
An app written for the earlier Bootstrap-row `Kpis` can keep its `row-cols-*`
classes: they still set the number of columns at each breakpoint. `Kpi` sets
its figure in the body face with tabular figures, sized to its own tile (a
container query), so a figure in a narrow column steps down rather than
overflowing. `delta` is a percent change shown as a
`DeltaBadge`, where a rise is bad unless `deltaGoodWhen="up"`; `spark` is a
small chart under the figure, hidden from assistive tech.

```jsx
<Kpis>
  <Kpi label="Cash" value={usd0(22791)} tone="pos" delta={3.2} deltaGoodWhen="up" spark={<Spark … />} />
  <Kpi label="Cards" value={usd0(-1284)} tone="neg" delta={-8.1} hint="due the 14th" />
</Kpis>
```

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

## Browser tests in CI

`.github/workflows/browser-tests.yml` runs an app's browser tests inside the
official Playwright image, on a GitHub-hosted runner. Nothing downloads a
browser, and Chromium and its fonts only change when the Playwright version
does. A Playwright app's whole job is:

```yaml
browser:
  uses: mdanifo/danifo-ui/.github/workflows/browser-tests.yml@v0.4.2
  with:
    working-directory: frontend
```

The image's tag comes from `@playwright/test` in that directory's
`package-lock.json`, so the two cannot drift apart. `setup` and `test` default
to `npm ci` and `npx playwright test`; `python-version` adds a Python for a
backend. A pytest suite has no lockfile entry to read, so it pins the version
and installs the same one:

```yaml
browser:
  uses: mdanifo/danifo-ui/.github/workflows/browser-tests.yml@v0.4.2
  with:
    playwright-version: "1.64.1"
    python-version: "3.12"
    setup: |
      npm --prefix frontend ci
      npm --prefix frontend run build
      python -m pip install -r requirements.txt "playwright==$PLAYWRIGHT_VERSION"
    test: python -m pytest tests/browser -q
```

Tests run against a local build with fake data, never a live site, and the
workflow passes no secrets. Failures upload `playwright-report` and
`test-results`. A screenshot baseline has to be rendered in the same image.
Call pip as `python -m pip`: the `pip` script that `setup-python` provides does
not run in a container. The default host is `ubuntu-24.04`, the release the
image is built on; `runner` changes it, but `ubuntu-latest` is still run as
`ubuntu-24.04`. A self-hosted runner needs Docker. Everything in the container
runs as root, so the job ends by handing the runner's work directory back to
its owner; otherwise the runner's next job outside a container could not
delete the checkout.

## Release

Bump `version`, tag `vX.Y.Z` and push the tag. The Release workflow checks
the tag against `package.json`, runs the tests, builds, and publishes a
GitHub Release with the packed tarball attached. Then bump each app.
