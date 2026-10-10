import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_THEME_STORAGE_KEY,
  THEMES,
  applyTheme,
  configureTheme,
  getThemeStorageKey,
  initTheme,
  prefersDark,
  readStoredTheme,
  resolveTheme,
  setTheme,
  storeTheme,
  themeStorageKey,
} from "./theme.js";

const painted = () => document.documentElement.getAttribute("data-bs-theme");

/** A copy of the module with its own watcher state. */
async function freshTheme() {
  vi.resetModules();
  return import("./theme.js");
}

/** Swap window.matchMedia for the duration of `fn`. */
async function withMatchMedia(replacement, fn) {
  const original = window.matchMedia;
  window.matchMedia = replacement;
  try {
    await fn();
  } finally {
    window.matchMedia = original;
  }
}

describe("theme selection", () => {
  it("defaults to system and resolves it to a Bootstrap color mode", () => {
    expect(readStoredTheme()).toBe("system");
    applyTheme("system");
    expect(painted()).toBe("light");
  });

  it("follows prefers-color-scheme when the choice is system", () => {
    window.__prefersDark = true;
    applyTheme("system");
    expect(painted()).toBe("dark");

    window.__prefersDark = false;
    applyTheme("system");
    expect(painted()).toBe("light");
  });

  it("marks the root element for an explicit choice", () => {
    setTheme("dark");
    expect(painted()).toBe("dark");

    setTheme("light");
    expect(painted()).toBe("light");
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
    expect(painted()).toBe("dark");
    expect(readStoredTheme()).toBe("system");
  });

  it("keeps an explicit choice when the system preference changes", () => {
    setTheme("light");
    initTheme();
    window.__prefersDark = true;
    window.__notifyMedia();
    expect(painted()).toBe("light");
  });

  it("updates a system choice when the system preference changes", () => {
    setTheme("system");
    initTheme();
    window.__prefersDark = true;
    window.__notifyMedia();
    expect(painted()).toBe("dark");
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
    expect(painted()).toBe("dark");
  });

  it("survives window.localStorage itself throwing (storage disabled)", () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    try {
      expect(readStoredTheme()).toBe("system");
      expect(() => storeTheme("dark")).not.toThrow();
      expect(setTheme("dark")).toBe("dark");
    } finally {
      Object.defineProperty(window, "localStorage", descriptor);
    }
  });
});

describe("configureTheme", () => {
  it("only accepts a non-empty string key, and always returns the key in use", () => {
    expect(configureTheme({ storageKey: "finance:theme" })).toBe("finance:theme");
    expect(configureTheme({ storageKey: "" })).toBe("finance:theme");
    expect(configureTheme({ storageKey: 42 })).toBe("finance:theme");
    expect(configureTheme({})).toBe("finance:theme");
    expect(configureTheme()).toBe("finance:theme");
    expect(getThemeStorageKey()).toBe("finance:theme");
  });

  it("keeps the deprecated themeStorageKey() in step", () => {
    configureTheme({ storageKey: "jobs:theme" });
    expect(themeStorageKey()).toBe("jobs:theme");
  });

  it("starts from the shared default key", () => {
    expect(getThemeStorageKey()).toBe(DEFAULT_THEME_STORAGE_KEY);
    expect(THEMES).toEqual(["system", "light", "dark"]);
  });
});

describe("resolveTheme / applyTheme / setTheme", () => {
  it("never consults the system for an explicit choice", () => {
    window.__prefersDark = true;
    expect(resolveTheme("light")).toBe("light");
    window.__prefersDark = false;
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("treats anything unknown as system", () => {
    window.__prefersDark = true;
    expect(resolveTheme("chartreuse")).toBe("dark");
    expect(applyTheme("chartreuse")).toBe("system");
    expect(painted()).toBe("dark");
    expect(setTheme(undefined)).toBe("system");
    expect(readStoredTheme()).toBe("system");
  });

  it("paints the root it is given instead of the document", () => {
    const root = document.createElement("div");
    expect(applyTheme("dark", root)).toBe("dark");
    expect(root.getAttribute("data-bs-theme")).toBe("dark");
    expect(painted()).toBeNull();

    setTheme("light", { root });
    expect(root.getAttribute("data-bs-theme")).toBe("light");
    expect(painted()).toBeNull();
  });

  it("stores into the storage it is given", () => {
    const store = new Map();
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
    setTheme("dark", { storage });
    expect(store.get(DEFAULT_THEME_STORAGE_KEY)).toBe("dark");
    expect(readStoredTheme(storage)).toBe("dark");
    expect(window.localStorage.getItem(DEFAULT_THEME_STORAGE_KEY)).toBeNull();
  });
});

describe("prefersDark", () => {
  it("is false when matchMedia is missing or throws", async () => {
    await withMatchMedia(undefined, () => {
      expect(prefersDark()).toBe(false);
      expect(resolveTheme("system")).toBe("light");
    });
    await withMatchMedia(
      () => {
        throw new Error("no media queries here");
      },
      () => {
        expect(prefersDark()).toBe(false);
      },
    );
  });
});

describe("initTheme", () => {
  it("applies the stored choice before anything renders and returns it", () => {
    window.localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, "dark");
    expect(initTheme()).toBe("dark");
    expect(painted()).toBe("dark");
  });

  it("watches the system preference once, however often it is called", async () => {
    const theme = await freshTheme();
    const addEventListener = vi.fn();
    await withMatchMedia(
      () => ({ matches: false, addEventListener }),
      () => {
        theme.initTheme();
        theme.initTheme();
        theme.initTheme();
      },
    );
    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("falls back to the legacy addListener API and still follows the system", async () => {
    const theme = await freshTheme();
    let listener;
    let dark = false;
    await withMatchMedia(
      () => ({
        get matches() {
          return dark;
        },
        addListener: (fn) => (listener = fn),
      }),
      () => {
        expect(theme.initTheme()).toBe("system");
        expect(painted()).toBe("light");
        dark = true;
        listener();
        expect(painted()).toBe("dark");
      },
    );
  });

  it("copes with a matchMedia that is absent or throws", async () => {
    let theme = await freshTheme();
    await withMatchMedia(undefined, () => {
      expect(theme.initTheme()).toBe("system");
      expect(painted()).toBe("light");
    });

    theme = await freshTheme();
    await withMatchMedia(
      () => {
        throw new Error("blocked");
      },
      () => {
        expect(theme.initTheme()).toBe("system");
        expect(painted()).toBe("light");
      },
    );
  });
});
