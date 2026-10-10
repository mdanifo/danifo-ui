import { expect, test } from "@playwright/test";
import { DESKTOP, PHONE, heading } from "./helpers.js";

const ROUTES = [
  ["/#/drawer/home", "The drawer layout"],
  ["/#/drawer/components", "Page chrome"],
  ["/#/drawer/long", "A long page"],
  ["/#/sidebar/home", "The sidebar layout"],
  ["/#/sidebar/components", "Page chrome"],
  ["/#/tabs/home", "The tabs layout"],
  ["/#/tabs/components", "Page chrome"],
  ["/", "The drawer layout"],
  ["/#/nonsense/route", "The drawer layout"],
];

for (const [name, options] of [
  ["phone", PHONE],
  ["desktop", DESKTOP],
]) {
  test.describe(`every route renders cleanly on a ${name}`, () => {
    test.use(options);

    test("without console errors or page errors", async ({ page }) => {
      const problems = [];
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") problems.push(`${message.type()}: ${message.text()}`);
      });
      for (const [route, title] of ROUTES) {
        await page.goto(route);
        await expect(heading(page), route).toHaveText(title);
        await expect(page.locator("#primary-nav")).toHaveCount(1);
      }
      expect(problems).toEqual([]);
    });

    test("the components page shows every piece of chrome", async ({ page }) => {
      await page.goto("/#/drawer/components");
      await expect(page.locator("#ledger .card-header")).toContainText("Ledger");
      await expect(page.locator("#ledger .badge")).toHaveText("+12%");
      await expect(page.getByRole("table")).toBeVisible();
      await expect(page.locator(".progress-bar")).toHaveCount(3);
      await expect(page.locator(".progress-bar").first()).toHaveCSS("width", /px$/);
      await expect(page.getByRole("status")).toBeVisible();
      await expect(page.getByRole("alert")).toHaveText("Could not reach the API.");
      await expect(page.locator(".card.border-danger")).toHaveCount(1);
      await expect(page.locator(".text-truncate").first()).toHaveCSS("text-overflow", "ellipsis");
    });
  });
}
