import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AppShell from "./AppShell.jsx";

const SECTIONS = ["Budget", "Payoff", "Taxes"];

function Harness({ routeKey = "a" }) {
  return (
    <AppShell
      brand="Finance"
      homeHref="#budget"
      routeKey={routeKey}
      renderNav={(close) =>
        SECTIONS.map((s) => (
          <a key={s} href={`#${s}`} className="nav-link" onClick={close}>{s}</a>
        ))}
      headerActions={<span>badge</span>}
    >
      <p>page</p>
    </AppShell>
  );
}

const nav = () => screen.getByRole("navigation", { name: "Primary", hidden: true });
const isOpen = () => nav().classList.contains("show");

describe("AppShell", () => {
  it("starts closed, with the hamburger at the upper right after the brand and actions", () => {
    render(<Harness />);
    expect(isOpen()).toBe(false);
    const header = document.querySelector("header");
    expect(header.lastElementChild).toHaveClass("menu-button");
    expect(header.firstElementChild).toHaveClass("navbar-brand");
    expect(screen.getByRole("link", { name: "Finance home" })).toHaveAttribute("href", "#budget");
  });

  it("opens on the hamburger and closes on a choice, Escape, a click outside, and the close button", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(isOpen()).toBe(true);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("link", { name: "Taxes" }));
    expect(isOpen()).toBe(false);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(document.querySelector(".offcanvas-backdrop"));
    expect(isOpen()).toBe(false);
    expect(document.querySelector(".offcanvas-backdrop")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(isOpen()).toBe(false);
  });

  it("closes when the route changes underneath it (back button, deep link)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness routeKey="a" />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    rerender(<Harness routeKey="b" />);
    expect(isOpen()).toBe(false);
  });

  it("renders the drawer from the right, so it opens toward the hamburger", () => {
    render(<Harness />);
    expect(nav()).toHaveClass("offcanvas-end");
    expect(nav()).not.toHaveClass("offcanvas-start");
  });

  it("renders the nav once, so a closing drawer cannot leave a second copy", () => {
    render(<Harness />);
    expect(document.querySelectorAll("#primary-nav")).toHaveLength(1);
  });
});
