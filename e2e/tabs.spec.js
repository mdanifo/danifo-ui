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

  test("tabs share the bar equally, and a long label truncates instead of widening its tab", async ({ page }) => {
    const tabs = tabbar(page).locator(".dui-tab");
    const bar = await tabbar(page).boundingBox();
    const widths = () => tabs.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
    expect(await widths()).toHaveLength(3);
    for (const width of await widths()) expect(Math.abs(width - bar.width / 3)).toBeLessThan(1);

    // Swap in a label that cannot fit a third of the screen. The tab must keep
    // its share and clip the text, rather than growing to its content and
    // pushing the bar past the viewport.
    const label = tabs.nth(1).locator(".dui-tab-label");
    await label.evaluate((el) => {
      el.textContent = "A label far too long for a third of a phone screen";
    });
    await expect(label).toHaveCSS("text-overflow", "ellipsis");
    const [scrollWidth, clientWidth] = await label.evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
    for (const width of await widths()) expect(Math.abs(width - bar.width / 3)).toBeLessThan(1);
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
    await expect(drawer(page)).toBeFocused();

    await drawer(page).getByRole("link", { name: "Long page" }).click();
    await expectDrawerClosed(page);
    await expect(heading(page)).toHaveText("A long page");
    await expect(more(page)).toHaveAttribute("aria-expanded", "false");
    await expect(more(page)).not.toHaveClass(/\bactive\b/);
    await expect(more(page)).toBeFocused();
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
