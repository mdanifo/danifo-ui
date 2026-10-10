import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ThemeToggle from "./ThemeToggle.jsx";
import { DEFAULT_THEME_STORAGE_KEY, configureTheme, readStoredTheme } from "./theme.js";

const painted = () => document.documentElement.getAttribute("data-bs-theme");
const select = () => screen.getByRole("combobox", { name: "Theme" });

describe("ThemeToggle", () => {
  it("offers system, light, and dark, and stores the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    expect(select()).toHaveValue("system");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["System", "Light", "Dark"]);

    await user.selectOptions(select(), "dark");
    expect(select()).toHaveValue("dark");
    expect(readStoredTheme()).toBe("dark");
    expect(painted()).toBe("dark");
  });

  it("starts from the choice stored under the app's key", () => {
    configureTheme({ storageKey: "flights:theme" });
    window.localStorage.setItem("flights:theme", "light");
    render(<ThemeToggle />);
    expect(select()).toHaveValue("light");
    expect(window.localStorage.getItem(DEFAULT_THEME_STORAGE_KEY)).toBeNull();
  });

  it("going back to system follows the OS again", async () => {
    const user = userEvent.setup();
    window.__prefersDark = true;
    render(<ThemeToggle />);
    await user.selectOptions(select(), "light");
    expect(painted()).toBe("light");

    await user.selectOptions(select(), "system");
    expect(select()).toHaveValue("system");
    expect(painted()).toBe("dark");
    expect(readStoredTheme()).toBe("system");
  });

  it("is a small select with a replaceable class", () => {
    const { rerender } = render(<ThemeToggle />);
    expect(select()).toHaveClass("theme-select", "w-auto", "form-select-sm");

    rerender(<ThemeToggle className="ms-2" />);
    expect(select()).toHaveClass("ms-2", "form-select-sm");
    expect(select()).not.toHaveClass("theme-select");
  });
});
