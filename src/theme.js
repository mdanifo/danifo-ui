/**
 * Theme selection: "system" (default), "light", or "dark".
 *
 * Bootstrap reads `data-bs-theme` and has no "system" value, so system is
 * resolved here to light or dark from `prefers-color-scheme`. An explicit
 * choice wins until the user goes back to system. Reading the stored value on
 * module load and applying it before React paints avoids a flash of the wrong
 * theme.
 *
 * Each app calls `configureTheme({ storageKey })` once so preferences stay
 * per-app (e.g. "workout-dashboard:theme", "finance:theme").
 */

export const THEMES = ["system", "light", "dark"];
export const DEFAULT_THEME_STORAGE_KEY = "danifo:theme";

let storageKey = DEFAULT_THEME_STORAGE_KEY;

/** Set the localStorage key before initTheme / ThemeToggle. Per-app. */
export function configureTheme({ storageKey: key } = {}) {
  if (typeof key === "string" && key) storageKey = key;
  return storageKey;
}

export function getThemeStorageKey() {
  return storageKey;
}

/** @deprecated Prefer getThemeStorageKey(); kept for apps that imported the const. */
export function themeStorageKey() {
  return storageKey;
}

export function readStoredTheme(storage) {
  const store = storage ?? safeLocalStorage();
  try {
    const value = store?.getItem(storageKey);
    return THEMES.includes(value) ? value : "system";
  } catch {
    return "system";
  }
}

export function prefersDark() {
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches === true;
  } catch {
    return false;
  }
}

/** The light/dark value Bootstrap should actually paint. */
export function resolveTheme(theme) {
  if (theme === "dark" || theme === "light") return theme;
  return prefersDark() ? "dark" : "light";
}

export function applyTheme(theme, root) {
  const element = root ?? document.documentElement;
  const choice = THEMES.includes(theme) ? theme : "system";
  element.setAttribute("data-bs-theme", resolveTheme(choice));
  return choice;
}

export function storeTheme(theme, storage) {
  const store = storage ?? safeLocalStorage();
  try {
    store?.setItem(storageKey, theme);
  } catch {
    /* private mode or storage disabled - the theme still applies for this visit */
  }
}

export function setTheme(theme, { root, storage } = {}) {
  const next = THEMES.includes(theme) ? theme : "system";
  applyTheme(next, root);
  storeTheme(next, storage);
  return next;
}

function safeLocalStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

let systemWatcher = null;

function bindSystemTheme() {
  if (systemWatcher || typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return;
  }
  let query;
  try {
    query = window.matchMedia("(prefers-color-scheme: dark)");
  } catch {
    return;
  }
  const onChange = () => {
    if (readStoredTheme() === "system") applyTheme("system");
  };
  if (query.addEventListener) query.addEventListener("change", onChange);
  else query.addListener?.(onChange);
  systemWatcher = onChange;
}

/** Apply the stored preference as early as possible. */
export function initTheme() {
  const theme = applyTheme(readStoredTheme());
  bindSystemTheme();
  return theme;
}
