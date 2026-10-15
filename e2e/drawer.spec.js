import { expect, test } from "@playwright/test";
import {
  PHONE,
  backdrop,
  canFocusFirstLink,
  drawer,
  expectDrawerClosed,
  expectDrawerOpen,
  hamburger,
  heading,
  homeLink,
  lineCount,
  sidewaysOverflow,
} from "./helpers.js";

test.use(PHONE);

test.describe("the drawer layout on a phone", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/drawer/home");
    await expect(heading(page)).toHaveText("The drawer layout");
  });

  test("starts closed, parked off-screen to the right, with links that cannot take focus", async ({ page }) => {
    await expectDrawerClosed(page);
    const rect = await drawer(page).evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(rect.left).toBeGreaterThanOrEqual(PHONE.viewport.width);
    expect(await canFocusFirstLink(page)).toBe(false);
  });

  test("keeps the brand on the left and the hamburger flush right, after the header actions", async ({ page }) => {
    const brand = await homeLink(page).boundingBox();
    const theme = await page.getByRole("combobox", { name: "Theme" }).boundingBox();
    const button = await hamburger(page).boundingBox();
    expect(brand.x).toBeLessThan(theme.x);
    expect(theme.x + theme.width).toBeLessThanOrEqual(button.x);
    expect(button.x + button.width).toBeGreaterThan(PHONE.viewport.width - 16);
    await expect(hamburger(page)).toHaveAttribute("aria-expanded", "false");
    await expect(hamburger(page)).toHaveAccessibleName("Open menu");
  });

  test("opens from the right, 280px wide, and its links become focusable", async ({ page }) => {
    await hamburger(page).click();
    await expectDrawerOpen(page);
    const box = await drawer(page).boundingBox();
    expect(Math.round(box.x + box.width)).toBe(PHONE.viewport.width);
    expect(Math.round(box.width)).toBe(280);
    expect(Math.round(box.height)).toBe(PHONE.viewport.height);
    await expect(hamburger(page)).toHaveAttribute("aria-expanded", "true");
    await expect(hamburger(page)).toHaveAccessibleName("Close menu");
    expect(await canFocusFirstLink(page)).toBe(true);
    // The backdrop covers the page; the page is hidden behind an opaque drawer.
    const shade = await backdrop(page).boundingBox();
    expect(shade).toEqual({ x: 0, y: 0, width: PHONE.viewport.width, height: PHONE.viewport.height });
    await expect(drawer(page)).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });

  test("closes on a choice, and the choice navigates", async ({ page }) => {
    await hamburger(page).click();
    await expectDrawerOpen(page);
    await drawer(page).getByRole("link", { name: "Components" }).click();
    await expectDrawerClosed(page);
    await expect(page).toHaveURL(/#\/drawer\/components$/);
    await expect(heading(page)).toHaveText("Page chrome");
  });

  test("closes on Escape", async ({ page }) => {
    await hamburger(page).click();
    await expectDrawerOpen(page);
    await page.keyboard.press("Escape");
    await expectDrawerClosed(page);
  });

  test("closes on a click outside it, handing focus back to the hamburger", async ({ page }) => {
    await hamburger(page).click();
    await expectDrawerOpen(page);
    await page.mouse.click(40, 500);
    await expectDrawerClosed(page);
    await expect(hamburger(page)).toBeFocused();
  });

  test("closes on its close button, handing focus back to the hamburger", async ({ page }) => {
    await hamburger(page).click();
    await expectDrawerOpen(page);
    await drawer(page).getByRole("button", { name: "Close" }).click();
    await expectDrawerClosed(page);
    await expect(hamburger(page)).toBeFocused();
  });

  test("moves focus onto the drawer when it opens, and back to the opener when it closes", async ({ page }) => {
    // The open drawer slides over the hamburger (280px of a 390px screen), so
    // focus has to travel with it: onto the drawer, then its close button and
    // links, and back to the hamburger once it closes.
    await hamburger(page).click();
    await expectDrawerOpen(page);
    await expect(drawer(page)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(drawer(page).getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(drawer(page).getByRole("link", { name: "Home" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expectDrawerClosed(page);
    await expect(hamburger(page)).toBeFocused();

    // Back on the hamburger, the keyboard keeps toggling it.
    await page.keyboard.press("Enter");
    await expectDrawerOpen(page);
    await expect(drawer(page)).toBeFocused();
    await page.keyboard.press("Escape");
    await expectDrawerClosed(page);
    await expect(hamburger(page)).toBeFocused();
  });

  test("closes when the route changes underneath it (the back button)", async ({ page }) => {
    await hamburger(page).click();
    await drawer(page).getByRole("link", { name: "Long page" }).click();
    await expect(page).toHaveURL(/#\/drawer\/long$/);
    await hamburger(page).click();
    await expectDrawerOpen(page);
    await page.goBack();
    await expect(page).toHaveURL(/#\/drawer\/home$/);
    await expectDrawerClosed(page);
  });

  test("the brand is a link home", async ({ page }) => {
    await page.goto("/#/drawer/components");
    await expect(heading(page)).toHaveText("Page chrome");
    await homeLink(page).click();
    await expect(page).toHaveURL(/#\/drawer\/home$/);
    await expect(heading(page)).toHaveText("The drawer layout");
  });

  test("the header stays pinned while a long page scrolls", async ({ page }) => {
    await page.goto("/#/drawer/long");
    await expect(heading(page)).toHaveText("A long page");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    await expect(page.getByTestId("last-line")).toBeInViewport();
    const header = await page.locator("header.app-header").boundingBox();
    expect(header.y).toBe(0);
    await expect(homeLink(page)).toBeInViewport();
  });
});

test.describe("nothing scrolls sideways at 390px", () => {
  for (const route of ["/#/drawer/home", "/#/drawer/components", "/#/drawer/long"]) {
    test(`${route} fits, closed and with the drawer open`, async ({ page }) => {
      await page.goto(route);
      await expect(heading(page)).toBeVisible();
      expect(await sidewaysOverflow(page)).toEqual([]);
      await hamburger(page).click();
      await expectDrawerOpen(page);
      expect(await sidewaysOverflow(page)).toEqual([]);
    });
  }

  test("a wide table scrolls inside its panel, not the page", async ({ page }) => {
    await page.goto("/#/drawer/components");
    const scroller = page.locator(".table-responsive");
    await expect(scroller).toBeVisible();
    const [scrollWidth, clientWidth] = await scroller.evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
    const box = await scroller.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(PHONE.viewport.width);
    // Money is right-aligned monospace.
    const cell = page.locator("td.font-monospace").first();
    await expect(cell).toHaveCSS("text-align", "right");
    await expect(cell).toHaveClass(/text-nowrap/);
  });

  test("a money range moves as one word, where a plain dash would let it break", async ({ page }) => {
    await page.goto("/#/drawer/home");
    await expect(page.getByTestId("range")).toHaveText("$13,955⁠–⁠14,556");
    expect(await lineCount(page.getByTestId("range"))).toBe(1);
    expect(await lineCount(page.getByTestId("range-naive"))).toBeGreaterThan(1);
  });

  test("a KPI figure inside a Panel overflows its column rather than breaking mid-number", async ({ page }) => {
    await page.goto("/#/drawer/home");
    const figure = page.getByTestId("kpi-range").locator(".dui-kpi-value");
    await expect(figure).toHaveText("$13,955⁠–⁠14,556");
    await expect(figure).toHaveCSS("overflow-wrap", "normal");
    expect(await lineCount(figure)).toBe(1);
    expect(await sidewaysOverflow(page)).toEqual([]);
  });
});
