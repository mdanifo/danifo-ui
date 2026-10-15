import { useCallback, useEffect, useRef, useState } from "react";

/**
 * App shell for the danifo.dev dashboards: a sticky header with the brand on
 * the left and the hamburger on the right, and one <nav> for all navigation.
 *
 * `layout`: "drawer" (default) slides the nav in from the right at any width;
 * "sidebar" makes it a permanent left column from Bootstrap's lg breakpoint
 * and keeps the drawer below it. `renderTabs` adds a fixed bottom tab bar
 * below lg, with a More button that opens the drawer; the main area is padded
 * for the bar.
 *
 * The brand is a link to `homeHref`. `renderBrandLink` lets a react-router app
 * wrap the same props (className, children, href, aria-label) in a NavLink.
 *
 * The app renders its links through `renderNav(close)` and calls `close` when
 * one is chosen. The drawer also closes on Escape, a click outside, its close
 * button, and a change of `routeKey`. Opening moves focus onto the nav;
 * closing returns it to the button that opened it.
 */
export default function AppShell({
  brand,
  brandSub = "danifo.dev",
  brandImage = null,
  brandAriaLabel,
  homeHref = "/",
  renderBrandLink,
  renderNav,
  renderTabs = null,
  layout = "drawer",
  moreLabel = "More",
  headerActions = null,
  routeKey,
  children,
}) {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const openerRef = useRef(null);
  // `close` keeps one identity so an app can memoize its links on it.
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback((event) => {
    openerRef.current = event.currentTarget;
    setOpen((o) => !o);
  }, []);
  const sidebar = layout === "sidebar";
  const hasTabs = typeof renderTabs === "function";

  useEffect(() => setOpen(false), [routeKey]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    const nav = navRef.current;
    if (open) {
      nav.focus({ preventScroll: true });
      return;
    }
    const opener = openerRef.current;
    openerRef.current = null;
    if (!opener?.isConnected) return;
    // Only when the drawer took focus with it; an app that moved focus itself
    // (say, to a search field) keeps its choice.
    const active = document.activeElement;
    if (active === document.body || nav.contains(active)) opener.focus({ preventScroll: true });
  }, [open]);

  const homeLabel = brandAriaLabel ?? `${brand} home`;

  let image = null;
  if (typeof brandImage === "string" && brandImage) {
    image = <img src={brandImage} alt="" className="dui-brand-image" />;
  } else if (brandImage && typeof brandImage === "object" && brandImage.src) {
    image = (
      <img
        src={brandImage.src}
        alt={brandImage.alt ?? ""}
        className="dui-brand-image"
        width={brandImage.width}
        height={brandImage.height}
      />
    );
  } else if (brandImage) {
    image = brandImage;
  }

  const brandBody = (
    <>
      {image}
      <span className="dui-brand-text d-flex flex-column">
        <span className="fw-bold lh-sm">{brand}</span>
        {brandSub ? (
          <span className="dui-brand-sub text-uppercase text-body-secondary">{brandSub}</span>
        ) : null}
      </span>
    </>
  );
  // Row layout when a logo sits beside the wordmark.
  const brandClass = [
    "navbar-brand",
    "dui-brand-link",
    "d-flex",
    image ? "flex-row align-items-center gap-2" : "flex-column",
    "py-0",
    "me-0",
    "text-body",
    "text-decoration-none",
  ].join(" ");

  const brandLinkProps = {
    className: brandClass,
    children: brandBody,
    href: homeHref,
    "aria-label": homeLabel,
  };

  // In the sidebar layout the drawer chrome drops away at lg (Bootstrap's
  // .offcanvas-lg) and the nav becomes an ordinary flex child: a column.
  const navClass = [
    "primary-nav",
    sidebar ? "offcanvas-lg dui-sidebar" : "offcanvas",
    "offcanvas-end",
    open ? "show" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`dui-shell min-vh-100${sidebar ? " dui-shell-sidebar d-lg-flex" : ""}`}>
      {open && <div className={`offcanvas-backdrop fade show${sidebar ? " d-lg-none" : ""}`} onClick={close} />}
      <nav id="primary-nav" ref={navRef} className={navClass} aria-label="Primary" tabIndex={-1}>
        <div className={`offcanvas-header border-bottom py-2${sidebar ? " d-lg-none" : ""}`}>
          <span className="fw-bold">{brand}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={close} />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-1 p-2">{renderNav(close)}</div>
      </nav>

      <div className="d-flex flex-column min-vh-100 flex-grow-1 min-w-0">
        <header className="app-header navbar sticky-top bg-body border-bottom px-2 px-lg-3 flex-nowrap">
          {renderBrandLink
            ? renderBrandLink(brandLinkProps)
            : (
              <a className={brandClass} href={homeHref} aria-label={homeLabel}>
                {brandBody}
              </a>
            )}
          <div className="dui-header-end ms-auto d-flex align-items-center gap-2">
            {headerActions}
            <button
              type="button"
              className={`menu-button navbar-toggler border-0${sidebar ? " d-lg-none" : ""}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="primary-nav"
              onClick={toggle}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>
        </header>
        <main className={`app-main flex-grow-1 min-w-0${hasTabs ? " dui-has-tabbar" : ""}`}>{children}</main>
      </div>

      {hasTabs ? (
        <nav className="dui-tabbar d-lg-none" aria-label="Main pages">
          {renderTabs()}
          <button
            type="button"
            className={`dui-tab dui-tab-more${open ? " active" : ""}`}
            aria-label={`${moreLabel}: open the full menu`}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={toggle}
          >
            <span className="dui-tab-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                <circle cx="4" cy="11" r="2" />
                <circle cx="11" cy="11" r="2" />
                <circle cx="18" cy="11" r="2" />
              </svg>
            </span>
            <span className="dui-tab-label">{moreLabel}</span>
          </button>
        </nav>
      ) : null}
    </div>
  );
}
