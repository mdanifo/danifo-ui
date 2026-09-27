import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_STORAGE_KEY,
  applyTheme,
  configureTheme,
  getThemeStorageKey,
  initTheme,
  readStoredTheme,
  setTheme,
} from "./theme.js";

beforeEach(() => {
  configureTheme({ storageKey: DEFAULT_THEME_STORAGE_KEY });
  document.documentElement.removeAttribute("data-bs-theme");
  window.localStorage.clear();
  window.__prefersDark = false;
});

describe("theme selection", () => {
  it("defaults to system and resolves it to a Bootstrap color mode", () => {
    expect(readStoredTheme()).toBe("system");
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
  });

  it("follows prefers-color-scheme when the choice is system", () => {
    window.__prefersDark = true;
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");

    window.__prefersDark = false;
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
  });

  it("marks the root element for an explicit choice", () => {
    setTheme("dark");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");

    setTheme("light");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
  });

  it("remembers the choice across visits under the configured key", () => {
    configureTheme({ storageKey: "workout-dashboard:theme" });
    setTheme("dark");
    expect(window.localStorage.getItem("workout-dashboard:theme")).toBe("dark");
    expect(getThemeStorageKey()).toBe("workout-dashboard:theme");
    expect(readStoredTheme()).toBe("dark");
  });

  it("going back to system follows the media query again", () => {
    window.__prefersDark = true;
    setTheme("light");
    setTheme("system");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
    expect(readStoredTheme()).toBe("system");
  });

  it("keeps an explicit choice when the system preference changes", () => {
    setTheme("light");
    initTheme();
    window.__prefersDark = true;
    window.__notifyMedia();
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
  });

  it("updates a system choice when the system preference changes", () => {
    setTheme("system");
    initTheme();
    window.__prefersDark = true;
    window.__notifyMedia();
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
  });

  it("ignores a stored value that is not a theme", () => {
    window.localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, "chartreuse");
    expect(readStoredTheme()).toBe("system");
  });

  it("survives storage being unavailable", () => {
    const exploding = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
    };
    expect(readStoredTheme(exploding)).toBe("system");
    expect(setTheme("dark", { storage: exploding })).toBe("dark");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
  });
});
