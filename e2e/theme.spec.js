import { expect, test } from "@playwright/test";
import { DESKTOP, heading } from "./helpers.js";

const STORAGE_KEY = "danifo-ui-demo:theme";
const LIGHT_BG = "rgb(255, 255, 255)"; // $body-bg
const DARK_BG = "rgb(18, 20, 26)"; // $body-bg-dark

const mode = (page) => page.locator("html").getAttribute("data-bs-theme");
const select = (page) => page.getByRole("combobox", { name: "Theme" });
const stored = (page, key = STORAGE_KEY) => page.evaluate((k) => window.localStorage.getItem(k), key);

test.use(DESKTOP);

test.describe("theme", () => {
  test("follows the OS by default: light is white, dark is dark, live", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/#/drawer/home");
    await expect(heading(page)).toBeVisible();
    expect(await mode(page)).toBe("light");
    await expect(select(page)).toHaveValue("system");
    await expect(page.locator("body")).toHaveCSS("background-color", LIGHT_BG);
    expect(await stored(page)).toBeNull();

    // The OS flips while the page is open: no reload needed.
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
    await expect(page.locator("body")).toHaveCSS("background-color", DARK_BG);
    await expect(select(page)).toHaveValue("system");

    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "light");
  });

  test("starts dark on a dark OS", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/#/drawer/home");
    await expect(heading(page)).toBeVisible();
    expect(await mode(page)).toBe("dark");
    await expect(page.locator("body")).toHaveCSS("background-color", DARK_BG);
  });

  test("an explicit choice wins, survives a reload, and system hands control back", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/#/drawer/home");
    await select(page).selectOption("dark");
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
    await expect(page.locator("body")).toHaveCSS("background-color", DARK_BG);
    expect(await stored(page)).toBe("dark");

    await page.reload();
    await expect(heading(page)).toBeVisible();
    expect(await mode(page)).toBe("dark");
    await expect(select(page)).toHaveValue("dark");

    // Still dark while the OS says light; back to system follows the OS again.
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
    await select(page).selectOption("system");
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "light");
    expect(await stored(page)).toBe("system");

    await select(page).selectOption("light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "light");
    await expect(page.locator("body")).toHaveCSS("background-color", LIGHT_BG);
  });

  test("the choice is stored under the app's own key", async ({ page }) => {
    await page.goto("/#/drawer/home");
    await select(page).selectOption("dark");
    expect(await stored(page, STORAGE_KEY)).toBe("dark");
    expect(await stored(page, "danifo:theme")).toBeNull();
  });
});
