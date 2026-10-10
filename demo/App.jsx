import { useEffect, useState } from "react";
import { AppShell, ThemeToggle } from "@danifo/ui";
import { ComponentsPage, HomePage, LongPage } from "./pages.jsx";

/**
 * Hash routes are `#/<layout>/<page>`: the layout axis shows AppShell's three
 * shapes, the page axis gives each one the same content. The drawer lists the
 * pages of the current layout, then the other layouts.
 */
export const LAYOUTS = ["drawer", "sidebar", "tabs"];
export const PAGES = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "components", label: "Components", icon: "▦" },
  { id: "long", label: "Long page", icon: "≡" },
];

export function parseRoute(hash) {
  const [, layout = "drawer", page = "home"] = (hash || "").replace(/^#/, "").split("/");
  return {
    layout: LAYOUTS.includes(layout) ? layout : "drawer",
    page: PAGES.some((p) => p.id === page) ? page : "home",
  };
}

export const href = (layout, page) => `#/${layout}/${page}`;

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return parseRoute(hash);
}

const LOGO =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1c7c54"/><text x="16" y="22" font-size="18" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#fff">d</text></svg>',
  );

export default function App() {
  const { layout, page } = useHashRoute();
  const routeKey = `${layout}/${page}`;

  const renderNav = (close) => (
    <>
      {PAGES.map((p) => (
        <a
          key={p.id}
          href={href(layout, p.id)}
          className={`nav-link${p.id === page ? " active" : ""}`}
          aria-current={p.id === page ? "page" : undefined}
          onClick={close}
        >
          {p.label}
        </a>
      ))}
      <hr className="my-2" />
      <span className="small text-uppercase text-body-secondary px-3">Layout</span>
      {LAYOUTS.map((l) => (
        <a
          key={l}
          href={href(l, page)}
          className={`nav-link${l === layout ? " active" : ""}`}
          aria-current={l === layout ? "true" : undefined}
          onClick={close}
        >
          {l === "drawer" ? "Drawer (default)" : l === "sidebar" ? "Sidebar" : "Tab bar"}
        </a>
      ))}
    </>
  );

  const renderTabs =
    layout === "tabs"
      ? () =>
          PAGES.slice(0, 2).map((p) => (
            <a
              key={p.id}
              href={href("tabs", p.id)}
              className={`dui-tab${p.id === page ? " active" : ""}`}
              aria-current={p.id === page ? "page" : undefined}
            >
              <span className="dui-tab-icon" aria-hidden="true">{p.icon}</span>
              <span className="dui-tab-label">{p.label}</span>
            </a>
          ))
      : null;

  const Page = page === "components" ? ComponentsPage : page === "long" ? LongPage : HomePage;

  return (
    <AppShell
      brand="Danifo UI"
      brandSub="demo"
      brandImage={LOGO}
      brandAriaLabel="Danifo UI demo — home"
      homeHref={href(layout, "home")}
      layout={layout === "sidebar" ? "sidebar" : "drawer"}
      renderNav={renderNav}
      renderTabs={renderTabs}
      headerActions={<ThemeToggle />}
      routeKey={routeKey}
    >
      <div className="demo-page" data-layout={layout} data-page={page}>
        <Page layout={layout} />
      </div>
    </AppShell>
  );
}
