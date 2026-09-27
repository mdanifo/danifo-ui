import React, { useEffect, useState } from "react";

/**
 * The danifo.dev app shell: a header with the brand on the left and the
 * hamburger at the upper right (page content is left-justified, so the menu
 * control stays out of the reading column). Every section lives in one drawer
 * that slides in from the right, hidden until the hamburger opens it, at every
 * width. An always-open desktop sidebar took a fixed column from every page,
 * so there is none.
 *
 * Router-agnostic: the app renders its own links through `renderNav(close)`
 * (NavLink for react-router, plain anchors for a hash router) and calls
 * `close` when one is chosen. The drawer also closes on Escape, on a click
 * outside it, on its close button, and whenever `routeKey` changes (the back
 * button, a deep link).
 *
 * One node driven by this component's own state, not react-bootstrap's
 * Offcanvas: that component portals a second element with the same id while
 * the first is still closing, so the closed drawer is briefly two elements and
 * one stays visible. Bootstrap's .offcanvas is hidden (visibility as well as
 * off-screen) until .show, so a closed drawer's links cannot take focus.
 */
export default function AppShell({
  brand,
  brandSub = "danifo.dev",
  homeHref = "/",
  renderBrandLink,
  renderNav,
  headerActions = null,
  routeKey,
  children,
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => setOpen(false), [routeKey]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const brandBody = (
    <>
      <span className="fw-bold lh-sm">{brand}</span>
      <span className="dui-brand-sub text-uppercase text-body-secondary">{brandSub}</span>
    </>
  );
  const brandClass = "navbar-brand d-flex flex-column py-0 me-auto text-body text-decoration-none";

  return (
    <div className="dui-shell min-vh-100">
      {open && <div className="offcanvas-backdrop fade show" onClick={close} />}
      <nav
        id="primary-nav"
        className={`primary-nav offcanvas offcanvas-end${open ? " show" : ""}`}
        aria-label="Primary"
      >
        <div className="offcanvas-header border-bottom py-2">
          <span className="fw-bold">{brand}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={close} />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-1 p-2">{renderNav(close)}</div>
      </nav>

      <div className="d-flex flex-column min-vh-100">
        <header className="app-header navbar sticky-top bg-body border-bottom px-2 px-lg-3">
          {renderBrandLink
            ? renderBrandLink({ className: brandClass, children: brandBody })
            : (
              <a className={brandClass} href={homeHref} aria-label={`${brand} home`}>
                {brandBody}
              </a>
            )}
          <div className="d-flex align-items-center gap-2">{headerActions}</div>
          <button
            type="button"
            className="menu-button navbar-toggler border-0 ms-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="navbar-toggler-icon" />
          </button>
        </header>
        <main className="app-main flex-grow-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
