import React, { useEffect, useState } from "react";

/**
 * The danifo.dev app shell: brand on the left (always a link home — text and/or
 * an optional logo image); theme controls and the hamburger grouped on the
 * right. Every section lives in one drawer that slides in from the right,
 * hidden until the hamburger opens it, at every width.
 *
 * Home link contract: set `homeHref` (hash or path). For react-router, pass
 * `renderBrandLink` that returns a NavLink using the provided `href` /
 * `aria-label`. Do not render the brand as plain text — it is how people go
 * home.
 *
 * Router-agnostic nav: the app renders links through `renderNav(close)` and
 * calls `close` when one is chosen. The drawer also closes on Escape, on a
 * click outside it, on its close button, and whenever `routeKey` changes.
 */
export default function AppShell({
  brand,
  brandSub = "danifo.dev",
  brandImage = null,
  brandAriaLabel,
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
              className="menu-button navbar-toggler border-0"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="primary-nav"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>
        </header>
        <main className="app-main flex-grow-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
