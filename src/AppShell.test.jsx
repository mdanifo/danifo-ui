import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
const hamburger = () => screen.getByRole("button", { name: /Open menu|Close menu/ });

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

  it("puts the header actions in the right-side cluster, before the hamburger", () => {
    render(<Harness />);
    const end = document.querySelector(".dui-header-end");
    expect(end.firstElementChild).toHaveTextContent("badge");
    expect(end.lastElementChild).toBe(hamburger());
  });

  it("renders the page inside main, and the brand name in the drawer header", () => {
    render(<Harness />);
    expect(document.querySelector("main.app-main")).toHaveTextContent("page");
    expect(nav().querySelector(".offcanvas-header")).toHaveTextContent("Finance");
  });

  it("shows the danifo.dev sub-brand by default, and none when told", () => {
    const { rerender } = render(<Harness />);
    expect(document.querySelector(".dui-brand-sub")).toHaveTextContent("danifo.dev");
    rerender(<Harness brandSub={null} />);
    expect(document.querySelector(".dui-brand-sub")).toBeNull();
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

  it("takes the logo as a URL, a descriptor with size and alt, or an element", () => {
    const { rerender } = render(<Harness brandImage="/mark.svg" />);
    let home = screen.getByRole("link", { name: "Finance home" });
    let img = home.querySelector("img.dui-brand-image");
    expect(img).toHaveAttribute("src", "/mark.svg");
    expect(img).toHaveAttribute("alt", "");
    expect(home).toHaveClass("flex-row", "align-items-center", "gap-2");

    rerender(<Harness brandImage={{ src: "/mark.png", alt: "Finance mark", width: 28, height: 28 }} />);
    img = screen.getByRole("img", { name: "Finance mark" });
    expect(img).toHaveAttribute("width", "28");
    expect(img).toHaveAttribute("height", "28");

    rerender(<Harness brandImage={{ src: "/mark.png" }} />);
    expect(screen.getByRole("link", { name: "Finance home" }).querySelector("img")).toHaveAttribute("alt", "");

    rerender(<Harness brandImage={<svg data-testid="inline-logo" />} />);
    home = screen.getByRole("link", { name: "Finance home" });
    expect(home).toContainElement(screen.getByTestId("inline-logo"));
    expect(home.querySelector("img")).toBeNull();

    rerender(<Harness brandImage="" />);
    home = screen.getByRole("link", { name: "Finance home" });
    expect(home.querySelector("img")).toBeNull();
    expect(home).toHaveClass("flex-column");
    expect(home).not.toHaveClass("flex-row");
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
    const home = screen.getByRole("link", { name: "Workout home" });
    expect(home).toHaveAttribute("href", "/schedules");
    expect(home).toHaveClass("navbar-brand", "dui-brand-link");
    expect(home).toHaveTextContent("Workout");
  });

  it("links home to the site root unless told otherwise", () => {
    render(
      <AppShell brand="Watch" renderNav={() => null}>
        <p>page</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Watch home" })).toHaveAttribute("href", "/");
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

  it("toggles closed from the same hamburger, which names the nav it controls", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(hamburger()).toHaveAttribute("aria-controls", "primary-nav");
    expect(hamburger()).toHaveAttribute("aria-expanded", "false");
    expect(nav()).toHaveAttribute("id", "primary-nav");
    await user.click(hamburger());
    expect(isOpen()).toBe(true);
    await user.click(hamburger());
    expect(isOpen()).toBe(false);
    expect(hamburger()).toHaveAttribute("aria-expanded", "false");
  });

  it("listens for Escape only while open", async () => {
    const user = userEvent.setup();
    const added = vi.spyOn(window, "addEventListener");
    const removed = vi.spyOn(window, "removeEventListener");
    const keydowns = (spy) => spy.mock.calls.filter(([type]) => type === "keydown").length;
    try {
      render(<Harness />);
      expect(keydowns(added)).toBe(0);
      await user.click(hamburger());
      expect(keydowns(added)).toBe(1);
      await user.keyboard("a");
      expect(isOpen()).toBe(true);
      await user.click(hamburger());
      expect(keydowns(removed)).toBe(1);
      await user.keyboard("{Escape}");
      expect(isOpen()).toBe(false);
    } finally {
      added.mockRestore();
      removed.mockRestore();
    }
  });

  it("moves focus onto the drawer when it opens, and back to the hamburger when it closes", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(nav()).toHaveAttribute("tabindex", "-1");
    await user.click(hamburger());
    expect(nav()).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    expect(hamburger()).toHaveFocus();

    await user.click(hamburger());
    expect(nav()).toHaveFocus();
    await user.click(screen.getByRole("link", { name: "Taxes" }));
    expect(isOpen()).toBe(false);
    expect(hamburger()).toHaveFocus();

    await user.click(hamburger());
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(hamburger()).toHaveFocus();
  });

  it("leaves focus where an app put it while the drawer was open", async () => {
    const user = userEvent.setup();
    render(<Harness headerActions={<input aria-label="Search" />} />);
    await user.click(hamburger());
    expect(nav()).toHaveFocus();
    const search = screen.getByRole("textbox", { name: "Search" });
    search.focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    expect(search).toHaveFocus();
  });

  it("closes when the route changes underneath it (back button, deep link)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness routeKey="a" />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    rerender(<Harness routeKey="b" />);
    expect(isOpen()).toBe(false);
  });

  it("hands renderNav the same close function on every render", () => {
    const seen = new Set();
    const renderNav = (close) => {
      seen.add(close);
      return null;
    };
    const { rerender } = render(<Harness renderNav={renderNav} routeKey="a" />);
    rerender(<Harness renderNav={renderNav} routeKey="b" />);
    rerender(<Harness renderNav={renderNav} routeKey="b" brand="Finance 2" />);
    expect(seen.size).toBe(1);
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

  it("treats an unknown layout as the drawer", () => {
    render(<Harness layout="split" />);
    expect(nav()).toHaveClass("offcanvas");
    expect(nav()).not.toHaveClass("offcanvas-lg");
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
    expect(more).toHaveAttribute("aria-controls", "primary-nav");
    await user.click(more);
    expect(isOpen()).toBe(true);
    expect(more).toHaveAttribute("aria-expanded", "true");
    expect(more).toHaveClass("active");
    expect(nav()).toHaveFocus();
    await user.click(screen.getByRole("link", { name: "Taxes" }));
    expect(isOpen()).toBe(false);
    expect(more).toHaveAttribute("aria-expanded", "false");
    expect(more).not.toHaveClass("active");
    expect(more).toHaveFocus();
  });

  it("copes with the opener disappearing while the drawer is open", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness renderTabs={tabs} />);
    await user.click(screen.getByRole("button", { name: /More: open the full menu/ }));
    expect(nav()).toHaveFocus();
    rerender(<Harness renderTabs={null} />);
    expect(screen.queryByRole("button", { name: /More: open the full menu/ })).toBeNull();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    expect(hamburger()).not.toHaveFocus();
  });

  it("More and the hamburger drive the same drawer", async () => {
    const user = userEvent.setup();
    render(<Harness renderTabs={tabs} />);
    await user.click(screen.getByRole("button", { name: /More: open the full menu/ }));
    expect(isOpen()).toBe(true);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(isOpen()).toBe(false);
    expect(screen.getByRole("button", { name: /More: open the full menu/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("takes a custom More label", () => {
    render(<Harness renderTabs={tabs} moreLabel="Menu" />);
    expect(screen.getByRole("button", { name: /Menu: open the full menu/ })).toHaveTextContent("Menu");
  });

  it("only renders a bar for a renderTabs function", () => {
    render(<Harness renderTabs={true} />);
    expect(document.querySelector(".dui-tabbar")).toBeNull();
    expect(document.querySelector("main")).not.toHaveClass("dui-has-tabbar");
  });
});
