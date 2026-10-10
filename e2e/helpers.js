import { expect } from "@playwright/test";

// The widths the dashboards are checked at: a 390px phone (the HANDOFF's
// "nothing scrolls sideways at 390px") and a laptop past Bootstrap's lg.
export const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
export const DESKTOP = { viewport: { width: 1280, height: 800 } };

export const drawer = (page) => page.locator("#primary-nav");
export const hamburger = (page) => page.locator("button.menu-button");
export const backdrop = (page) => page.locator(".offcanvas-backdrop");
export const homeLink = (page) => page.getByRole("link", { name: "Danifo UI demo — home" });
export const heading = (page) => page.getByRole("heading", { level: 1 });

export async function expectDrawerClosed(page) {
  await expect(drawer(page)).not.toHaveClass(/\bshow\b/);
  await expect(drawer(page)).toBeHidden();
  await expect(backdrop(page)).toHaveCount(0);
}

export async function expectDrawerOpen(page) {
  await expect(drawer(page)).toHaveClass(/\bshow\b/);
  await expect(drawer(page)).toBeVisible();
  await expect(backdrop(page)).toBeVisible();
}

/** Can the first drawer link take focus right now? (Hidden ones must not.) */
export function canFocusFirstLink(page) {
  return page.evaluate(() => {
    const link = document.querySelector("#primary-nav a.nav-link");
    link.focus();
    return document.activeElement === link;
  });
}

/**
 * Elements whose box pokes out of the viewport sideways: `html { overflow-x:
 * clip }` hides that from scrollWidth, so look at the boxes themselves. The
 * drawer (off-screen by design while it is a fixed panel), its backdrop, and
 * anything inside a horizontal scroll container (tables) are not overflow.
 */
export function sidewaysOverflow(page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const nav = document.querySelector("#primary-nav");
    const navIsPanel = nav && getComputedStyle(nav).position === "fixed";
    const inScroller = (el) => {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const { overflowX } = getComputedStyle(p);
        if (overflowX === "auto" || overflowX === "scroll" || overflowX === "hidden" || overflowX === "clip") return true;
      }
      return false;
    };
    const label = (el) =>
      el.tagName.toLowerCase() +
      (el.id ? `#${el.id}` : "") +
      (typeof el.className === "string" && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
        : "");
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      if (navIsPanel && el.closest("#primary-nav")) continue;
      if (el.closest(".offcanvas-backdrop")) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((r.right > width + 1 || r.left < -1) && !inScroller(el)) {
        out.push(`${label(el)} ${Math.round(r.left)}..${Math.round(r.right)} in ${width}`);
      }
    }
    return out;
  });
}

/** How many line boxes an element's text takes up (1: it never wrapped). */
export function lineCount(locator) {
  return locator.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getClientRects().length;
  });
}
