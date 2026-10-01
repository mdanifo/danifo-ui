import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AppShell from "./AppShell.jsx";

const SECTIONS = ["Budget", "Payoff", "Taxes"];

function Harness({ routeKey = "a", ...rest }) {
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
      {...rest}
    >
      <p>page</p>
    </AppShell>
  );
}

const nav = () => screen.getByRole("navigation", { name: "Primary", hidden: true });
const isOpen = () => nav().classList.contains("show");

describe("AppShell", () => {
  it("starts closed, with the hamburger in a right-side cluster after the brand", () => {
    render(<Harness />);
    expect(isOpen()).toBe(false);
    const header = document.querySelector("header");
    expect(header.firstElementChild).toHaveClass("navbar-brand", "dui-brand-link");
    const end = header.querySelector(".dui-header-end");
    expect(end).toHaveClass("ms-auto");
    expect(end.lastElementChild).toHaveClass("menu-button");
    expect(screen.getByRole("link", { name: "Finance home" })).toHaveAttribute("href", "#budget");
  });

  it("makes the brand a home link, optionally with a logo image", () => {
    render(
      <AppShell
        brand="Jobs"
        homeHref="/overview"
        brandImage={{ src: "/logo.svg", alt: "" }}
        renderNav={() => null}
      >
        <p>page</p>
      </AppShell>,
    );
    const home = screen.getByRole("link", { name: "Jobs home" });
    expect(home).toHaveAttribute("href", "/overview");
    expect(home.querySelector("img.dui-brand-image")).toHaveAttribute("src", "/logo.svg");
  });

  it("lets an app override the accessible home label (e.g. emoji in the brand)", () => {
    render(
      <AppShell
        brand="Finance 💚"
        brandAriaLabel="Finance, danifo.dev — home"
        homeHref="#budget/planner"
        renderNav={() => null}
      >
        <p>page</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Finance, danifo.dev — home" })).toHaveAttribute(
      "href",
      "#budget/planner",
    );
  });

  it("passes href and aria-label into renderBrandLink for react-router apps", () => {
    render(
      <AppShell
        brand="Workout"
        homeHref="/schedules"
        renderBrandLink={({ className, children, href, "aria-label": label }) => (
          <a className={className} href={href} aria-label={label}>{children}</a>
        )}
        renderNav={() => null}
      >
        <p>page</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Workout home" })).toHaveAttribute("href", "/schedules");
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

  it("keeps the default layout a drawer at every width, with no tab bar", () => {
    render(<Harness />);
    expect(nav()).toHaveClass("offcanvas");
    expect(nav()).not.toHaveClass("offcanvas-lg");
    expect(document.querySelector(".dui-shell")).not.toHaveClass("dui-shell-sidebar");
    expect(screen.getByRole("button", { name: "Open menu" })).not.toHaveClass("d-lg-none");
    expect(document.querySelector(".dui-tabbar")).toBeNull();
    expect(document.querySelector("main")).not.toHaveClass("dui-has-tabbar");
  });
});

describe("AppShell sidebar layout", () => {
  it("is a drawer below lg and a static column from lg, where the hamburger hides", async () => {
    const user = userEvent.setup();
    render(<Harness layout="sidebar" />);
    // Bootstrap's responsive offcanvas: drawer chrome below lg, in flow from lg.
    expect(nav()).toHaveClass("offcanvas-lg", "offcanvas-end", "dui-sidebar");
    expect(document.querySelector(".dui-shell")).toHaveClass("dui-shell-sidebar", "d-lg-flex");
    expect(nav().querySelector(".offcanvas-header")).toHaveClass("d-lg-none");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveClass("d-lg-none");
    // The drawer behaviour is unchanged where it still applies.
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(isOpen()).toBe(true);
    expect(document.querySelector(".offcanvas-backdrop")).toHaveClass("d-lg-none");
    await user.click(screen.getByRole("link", { name: "Payoff" }));
    expect(isOpen()).toBe(false);
  });

  it("puts the nav before the page in the DOM, so it reads first and sits on the left", () => {
    render(<Harness layout="sidebar" />);
    const shell = document.querySelector(".dui-shell");
    expect(shell.children[0]).toBe(nav());
    expect(shell.children[1].querySelector("main")).not.toBeNull();
  });
});

describe("AppShell tab bar", () => {
  const tabs = () =>
    ["Today", "History"].map((t) => (
      <a key={t} href={`#${t}`} className="dui-tab">
        <span className="dui-tab-icon" aria-hidden="true">•</span>
        <span className="dui-tab-label">{t}</span>
      </a>
    ));

  it("renders the given tabs plus More, and pads the page for the bar", () => {
    render(<Harness renderTabs={tabs} />);
    const bar = screen.getByRole("navigation", { name: "Main pages" });
    expect(bar).toHaveClass("dui-tabbar", "d-lg-none");
    expect(bar.querySelectorAll(".dui-tab")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("href", "#Today");
    expect(document.querySelector("main")).toHaveClass("dui-has-tabbar");
  });

  it("More opens the drawer, mirrors its state, and the drawer closes as usual", async () => {
    const user = userEvent.setup();
    render(<Harness renderTabs={tabs} />);
    const more = screen.getByRole("button", { name: /More: open the full menu/ });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(isOpen()).toBe(true);
    expect(more).toHaveAttribute("aria-expanded", "true");
    expect(more).toHaveClass("active");
    await user.click(screen.getByRole("link", { name: "Taxes" }));
    expect(isOpen()).toBe(false);
    expect(more).toHaveAttribute("aria-expanded", "false");
  });

  it("takes a custom More label", () => {
    render(<Harness renderTabs={tabs} moreLabel="Menu" />);
    expect(screen.getByRole("button", { name: /Menu: open the full menu/ })).toHaveTextContent("Menu");
  });
});
