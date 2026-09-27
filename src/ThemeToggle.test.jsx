import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "./ThemeToggle.jsx";
import { DEFAULT_THEME_STORAGE_KEY, configureTheme, readStoredTheme } from "./theme.js";

beforeEach(() => {
  configureTheme({ storageKey: DEFAULT_THEME_STORAGE_KEY });
  document.documentElement.removeAttribute("data-bs-theme");
  window.localStorage.clear();
  window.__prefersDark = false;
});

describe("ThemeToggle", () => {
  it("offers system, light, and dark, and stores the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const select = screen.getByRole("combobox", { name: "Theme" });
    expect(select).toHaveValue("system");

    await user.selectOptions(select, "dark");
    expect(select).toHaveValue("dark");
    expect(readStoredTheme()).toBe("dark");
    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
  });
});
