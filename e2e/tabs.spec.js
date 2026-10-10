import { expect, test } from "@playwright/test";
import { DESKTOP, PHONE, drawer, expectDrawerClosed, expectDrawerOpen, hamburger, heading, sidewaysOverflow } from "./helpers.js";

const tabbar = (page) => page.getByRole("navigation", { name: "Main pages" });
const more = (page) => page.getByRole("button", { name: /^More: open the full menu$/ });

test.describe("the tab bar on a phone", () => {
  test.use(PHONE);

  test.beforeEach(async ({ page }) => {
    await page.goto("/#/tabs/home");
    await expect(heading(page)).toHaveText("The tabs layout");
  });

  test("is fixed to the bottom edge, with the daily pages and More", async ({ page }) => {
    await expect(tabbar(page)).toBeVisible();
    const bar = await tabbar(page).boundingBox();
    expect(bar.x).toBe(0);
    expect(Math.round(bar.width)).toBe(PHONE.viewport.width);
    expect(Math.round(bar.y + bar.height)).toBe(PHONE.viewport.height);
    await expect(tabbar(page).locator(".dui-tab-label")).toHaveText(["Home", "Components", "More"]);
    await expect(tabbar(page).getByRole("link", { name: "Home" })).toHaveClass(/\bactive\b/);
    await expect(tabbar(page).getByRole("link", { name: "Home" })).toHaveCSS("color", "rgb(28, 124, 84)");
    expect(await sidewaysOverflow(page)).toEqual([]);
  });

  test("a tab navigates and takes the active colour", async ({ page }) => {
    await tabbar(page).getByRole("link", { name: "Components" }).click();
    await expect(page).toHaveURL(/#\/tabs\/components$/);
    await expect(heading(page)).toHaveText("Page chrome");
    await expect(tabbar(page).getByRole("link", { name: "Components" })).toHaveClass(/\bactive\b/);
    await expect(tabbar(page).getByRole("link", { name: "Home" })).not.toHaveClass(/\bactive\b/);
    await expectDrawerClosed(page);
  });

  test("the page never ends under the bar", async ({ page }) => {
    await page.goto("/#/tabs/long");
    await expect(heading(page)).toHaveText("A long page");
    await expect(page.locator("main")).toHaveCSS("padding-bottom", "60px");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const last = await page.getByTestId("last-line").boundingBox();
    const bar = await tabbar(page).boundingBox();
    expect(last.y + last.height).toBeLessThanOrEqual(bar.y);
    await expect(page.getByTestId("last-line")).toBeInViewport({ ratio: 1 });
  });

  test("More opens the full menu, mirrors it, and the menu closes as usual", async ({ page }) => {
    await expect(more(page)).toHaveAttribute("aria-expanded", "false");
    await expect(more(page)).toHaveAttribute("aria-controls", "primary-nav");
    await more(page).click();
    await expectDrawerOpen(page);
    await expect(more(page)).toHaveAttribute("aria-expanded", "true");
    await expect(more(page)).toHaveClass(/\bactive\b/);
    await expect(hamburger(page)).toHaveAttribute("aria-expanded", "true");

    await drawer(page).getByRole("link", { name: "Long page" }).click();
    await expectDrawerClosed(page);
    await expect(heading(page)).toHaveText("A long page");
    await expect(more(page)).toHaveAttribute("aria-expanded", "false");
    await expect(more(page)).not.toHaveClass(/\bactive\b/);
    await expect(tabbar(page)).toBeVisible();
  });
});

test.describe("the tab bar from lg", () => {
  test.use(DESKTOP);

  test("is gone, and the page gets no bottom padding", async ({ page }) => {
    await page.goto("/#/tabs/home");
    await expect(heading(page)).toHaveText("The tabs layout");
    await expect(tabbar(page)).toBeHidden();
    await expect(page.locator("main")).toHaveCSS("padding-bottom", "0px");
    await expect(hamburger(page)).toBeVisible();
    expect(await sidewaysOverflow(page)).toEqual([]);
  });
});
