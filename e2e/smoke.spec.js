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

    test("the home page shows KPI tiles with deltas and a sparkline, in the served fonts", async ({ page }) => {
      await page.goto("/#/drawer/home");
      const kpis = page.locator(".dui-kpis").first();
      await expect(kpis.locator(".dui-kpi")).toHaveCount(4);
      await expect(kpis.locator(".dui-kpi-delta .badge")).toHaveText(["+3%", "−8%", "—", "new"]);
      // A rise in cash is good; a fall in card debt is good.
      await expect(kpis.locator(".dui-kpi-delta .badge").nth(0)).toHaveClass(/bg-success-subtle/);
      await expect(kpis.locator(".dui-kpi-delta .badge").nth(1)).toHaveClass(/bg-success-subtle/);
      await expect(kpis.getByTestId("spark")).toBeVisible();
      await expect(kpis.getByTestId("spark").locator("path")).toHaveCSS("stroke", "rgb(42, 120, 214)");
      await expect(kpis.locator(".dui-kpi-value").first()).toHaveCSS("font-variant-numeric", "lining-nums tabular-nums");
      // The fonts come with the page: DM Sans for text and IBM Plex Mono for the
      // eyebrow label resolve to loaded faces, not a fallback.
      const loaded = await page.evaluate(async () => {
        const sans = await document.fonts.load('1em "DM Sans"');
        const mono = await document.fonts.load('500 1em "IBM Plex Mono"');
        return { sans: sans.length, mono: mono.length, status: document.fonts.status };
      });
      expect(loaded).toEqual({ sans: 1, mono: 1, status: "loaded" });
    });

    test("Kpis keeps an app's row-cols column count, and each figure is sized by its tile", async ({ page }) => {
      await page.goto("/#/drawer/home");
      // Apps written for the Bootstrap-row Kpis pass row-cols-* classes.
      const rows = await page.evaluate(() => {
        const measure = (classes) => {
          const row = document.createElement("div");
          row.className = `dui-kpis ${classes}`;
          for (let i = 0; i < 6; i += 1) {
            const tile = document.createElement("div");
            tile.className = "dui-kpi";
            tile.innerHTML = '<div class="dui-kpi-value">$1,234</div>';
            row.append(tile);
          }
          document.querySelector(".demo-page").append(row);
          const boxes = [...row.children].map((el) => el.getBoundingClientRect());
          const result = {
            width: row.getBoundingClientRect().width,
            perLine: boxes.filter((b) => Math.round(b.top) === Math.round(boxes[0].top)).length,
            tile: boxes[0].width,
            font: parseFloat(getComputedStyle(row.querySelector(".dui-kpi-value")).fontSize),
          };
          row.remove();
          return result;
        };
        return { three: measure("row-cols-3"), twoThenSix: measure("row-cols-2 row-cols-md-6") };
      });
      expect(rows.three.perLine).toBe(3);
      expect(rows.twoThenSix.perLine).toBe(name === "phone" ? 2 : 6);
      // A tile fills its column; row-cols would otherwise make it a third of it.
      expect(rows.three.tile).toBeGreaterThan(rows.three.width / 3 - 20);
      // The narrower tile gets the smaller figure, within the 1.25rem to 2.125rem bounds.
      const [narrow, wide] = rows.three.tile < rows.twoThenSix.tile ? [rows.three, rows.twoThenSix] : [rows.twoThenSix, rows.three];
      expect(narrow.font).toBeLessThan(wide.font);
      expect(narrow.font).toBeGreaterThanOrEqual(20);
      expect(wide.font).toBeLessThanOrEqual(34);
    });

    test("the components page shows every piece of chrome", async ({ page }) => {
      await page.goto("/#/drawer/components");
      await expect(page.locator("#ledger .card-header")).toContainText("Ledger");
      await expect(page.getByTestId("series-1")).toHaveCSS("background-color", "rgb(42, 120, 214)");
      await expect(page.getByTestId("series-6")).toHaveCSS("background-color", "rgb(0, 131, 0)");
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
