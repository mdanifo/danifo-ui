// @vitest-environment node
import { describe, expect, it } from "vitest";
import { applyTheme, initTheme, prefersDark, readStoredTheme, resolveTheme, setTheme, storeTheme } from "./theme.js";

// Server rendering and workers import the package too: the helpers must not
// touch window or document until they exist.
describe("theme helpers without a DOM", () => {
  it("has no window here", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("reads system, stores nothing, and never prefers dark", () => {
    expect(readStoredTheme()).toBe("system");
    expect(() => storeTheme("dark")).not.toThrow();
    expect(prefersDark()).toBe(false);
    expect(resolveTheme("system")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("applies and initialises without a document, returning the choice", () => {
    expect(applyTheme("dark")).toBe("dark");
    expect(setTheme("light")).toBe("light");
    expect(initTheme()).toBe("system");
  });

  it("still paints a root element it is handed", () => {
    const attrs = {};
    const root = { setAttribute: (k, v) => (attrs[k] = v) };
    expect(applyTheme("dark", root)).toBe("dark");
    expect(attrs["data-bs-theme"]).toBe("dark");
  });

  it("still uses a storage it is handed", () => {
    const store = new Map();
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
    storeTheme("dark", storage);
    expect(readStoredTheme(storage)).toBe("dark");
  });
});
