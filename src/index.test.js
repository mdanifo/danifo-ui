import { describe, expect, it } from "vitest";
import * as ui from "./index.js";

// The export list is the package's public contract: five apps pin it by tag.
// Removing or renaming one is a breaking change and should fail here first.
const SURFACE = [
  "AppShell",
  "ThemeToggle",
  "THEMES",
  "DEFAULT_THEME_STORAGE_KEY",
  "configureTheme",
  "getThemeStorageKey",
  "themeStorageKey",
  "readStoredTheme",
  "prefersDark",
  "resolveTheme",
  "applyTheme",
  "storeTheme",
  "setTheme",
  "initTheme",
  "num",
  "toneClass",
  "Eyebrow",
  "PageHeader",
  "Panel",
  "PanelHeading",
  "Kpis",
  "Kpi",
  "DataTable",
  "Foot",
  "CenterState",
  "Skeleton",
  "DeltaBadge",
  "BarRow",
  "usd",
  "usd0",
  "usdRange",
];

describe("package entry", () => {
  it("exports exactly the documented surface", () => {
    expect(Object.keys(ui).sort()).toEqual([...SURFACE].sort());
  });

  it("exports components and helpers as functions, and the constants as values", () => {
    for (const name of SURFACE) {
      if (name === "THEMES") expect(ui[name]).toEqual(["system", "light", "dark"]);
      else if (name === "DEFAULT_THEME_STORAGE_KEY") expect(ui[name]).toBe("danifo:theme");
      else if (name === "num") expect(typeof ui[name]).toBe("string");
      else expect(typeof ui[name], name).toBe("function");
    }
  });
});
