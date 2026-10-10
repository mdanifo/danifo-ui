import { expect, test } from "@playwright/test";
import {
  DESKTOP,
  PHONE,
  backdrop,
  canFocusFirstLink,
  drawer,
  expectDrawerClosed,
  expectDrawerOpen,
  hamburger,
  heading,
  sidewaysOverflow,
} from "./helpers.js";

test.describe("the sidebar layout from lg", () => {
  test.use(DESKTOP);

  test.beforeEach(async ({ page }) => {
    await page.goto("/#/sidebar/home");
    await expect(heading(page)).toHaveText("The sidebar layout");
  });

  test("is a permanent 220px column on the left, beside the page, with no drawer chrome", async ({ page }) => {
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page)).toHaveCSS("position", "sticky");
    const column = await drawer(page).boundingBox();
    expect(column.x).toBe(0);
    expect(Math.round(column.width)).toBe(220);
    expect(Math.round(column.height)).toBe(DESKTOP.viewport.height);
    const main = await page.locator("main").boundingBox();
    expect(Math.round(main.x)).toBe(220);
    await expect(hamburger(page)).toBeHidden();
    await expect(drawer(page).locator(".offcanvas-header")).toBeHidden();
    await expect(backdrop(page)).toHaveCount(0);
    expect(await canFocusFirstLink(page)).toBe(true);
    expect(await sidewaysOverflow(page)).toEqual([]);
  });

  test("its links navigate in place", async ({ page }) => {
    await drawer(page).getByRole("link", { name: "Components" }).click();
    await expect(page).toHaveURL(/#\/sidebar\/components$/);
    await expect(heading(page)).toHaveText("Page chrome");
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page).getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
  });

  test("the header is pinned and the column stays put while the page scrolls", async ({ page }) => {
    await page.goto("/#/sidebar/long");
    await expect(heading(page)).toHaveText("A long page");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    expect(Math.abs((await page.locator("header.app-header").boundingBox()).y)).toBeLessThan(1);
    expect(Math.abs((await drawer(page).boundingBox()).y)).toBeLessThan(1);
  });
});

test.describe("the sidebar layout below lg", () => {
  test.use(PHONE);

  test("is the same drawer as the default layout", async ({ page }) => {
    await page.goto("/#/sidebar/home");
    await expect(heading(page)).toHaveText("The sidebar layout");
    await expect(drawer(page)).toHaveClass(/offcanvas-lg/);
    await expectDrawerClosed(page);
    await expect(hamburger(page)).toBeVisible();
    expect(await canFocusFirstLink(page)).toBe(false);
    expect(await sidewaysOverflow(page)).toEqual([]);

    await hamburger(page).click();
    await expectDrawerOpen(page);
    const box = await drawer(page).boundingBox();
    expect(Math.round(box.x + box.width)).toBe(PHONE.viewport.width);
    await drawer(page).getByRole("link", { name: "Components" }).click();
    await expectDrawerClosed(page);
    await expect(heading(page)).toHaveText("Page chrome");
  });
});
