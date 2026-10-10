import { defineConfig } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// A sandbox with a system Chromium (no download allowed) can point Playwright
// at it; CI installs the matching browser instead and leaves this unset.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    browserName: "chromium",
    trace: "retain-on-failure",
    // Bootstrap animates the drawer and smooth-scrolls unless motion is
    // reduced; the tests measure where things end up, not how they get there.
    reducedMotion: "reduce",
    launchOptions: executablePath ? { executablePath } : {},
  },
  // The suite runs against a production build of the demo: that is what the
  // apps ship, and the preview server is up in a couple of seconds.
  webServer: {
    command: "npm run demo:build && npm run demo:preview",
    url: `${BASE_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
