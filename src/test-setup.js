import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// jsdom does not implement matchMedia. Shared with the theme watcher so a test
// can flip the color scheme and notify listeners.
const mediaListeners = new Map();

function mediaMatches(query) {
  if (query.includes("prefers-color-scheme: dark")) return window.__prefersDark === true;
  return false;
}

window.matchMedia = (query) => {
  if (!mediaListeners.has(query)) mediaListeners.set(query, new Set());
  const listeners = mediaListeners.get(query);
  return {
    media: query,
    get matches() {
      return mediaMatches(query);
    },
    addListener(fn) {
      listeners.add(fn);
    },
    removeListener(fn) {
      listeners.delete(fn);
    },
    addEventListener(type, fn) {
      if (type === "change") listeners.add(fn);
    },
    removeEventListener(type, fn) {
      listeners.delete(fn);
    },
    dispatchEvent() {
      return false;
    },
    onchange: null,
  };
};

window.__notifyMedia = () => {
  for (const [query, listeners] of mediaListeners) {
    const event = { matches: mediaMatches(query), media: query };
    listeners.forEach((fn) => fn(event));
  }
};

beforeEach(() => {
  document.documentElement.removeAttribute("data-bs-theme");
  window.localStorage.clear();
  window.__prefersDark = false;
});

// Testing Library only cleans up on its own when vitest globals are enabled.
afterEach(cleanup);
