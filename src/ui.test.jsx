import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  BarRow,
  CenterState,
  DataTable,
  DeltaBadge,
  Eyebrow,
  Foot,
  Kpi,
  Kpis,
  PageHeader,
  Panel,
  num,
  toneClass,
} from "./ui.jsx";

describe("Eyebrow / PageHeader", () => {
  it("renders the kicker and section chrome", () => {
    render(
      <PageHeader eyebrow="Budget" title="May" lede="A short lede." next="Next: dig in.">
        <span>extra</span>
      </PageHeader>,
    );
    expect(screen.getByText("Budget")).toHaveClass("text-uppercase");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("May");
    expect(screen.getByText("A short lede.")).toHaveClass("section-lede");
    expect(screen.getByText("Next: dig in.")).toHaveClass("section-next");
    expect(screen.getByText("extra")).toBeInTheDocument();
  });
});

describe("Panel", () => {
  it("wraps children in a card, with an alarm border when asked", () => {
    const { rerender } = render(
      <Panel eyebrow="Debt" extra={<span>more</span>} id="debt">
        body
      </Panel>,
    );
    expect(document.getElementById("debt")).toBeTruthy();
    expect(screen.getByText("Debt")).toBeInTheDocument();
    expect(screen.getByText("more")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();

    rerender(<Panel alarm>alarmed</Panel>);
    expect(screen.getByText("alarmed").closest(".card")).toHaveClass("border-danger");
  });
});

describe("Kpis / Kpi", () => {
  it("tones positive and negative values", () => {
    render(
      <Kpis>
        <Kpi label="Cash" value="$10" tone="pos" hint="up" />
        <Kpi label="Debt" value="$2" tone="neg" />
      </Kpis>,
    );
    expect(screen.getByText("$10")).toHaveClass("text-success");
    expect(screen.getByText("$2")).toHaveClass("text-danger");
    expect(screen.getByText("up")).toHaveClass("text-body-secondary");
  });
});

describe("DataTable / Foot / num / toneClass", () => {
  it("scrolls the table and exposes the money helpers", () => {
    render(
      <DataTable maxHeight={120} className="data-table">
        <tbody>
          <tr>
            <td className={num}>$1</td>
          </tr>
        </tbody>
      </DataTable>,
    );
    expect(document.querySelector(".table-responsive")).toHaveStyle({ maxHeight: "120px" });
    expect(screen.getByText("$1")).toHaveClass("font-monospace", "text-end");
    expect(num).toContain("font-monospace");
    expect(toneClass("pos")).toBe("text-success");
    expect(toneClass("neg")).toBe("text-danger");
    expect(toneClass()).toBe("");
  });

  it("renders a foot note", () => {
    render(<Foot>Source: ledger</Foot>);
    expect(screen.getByText("Source: ledger")).toHaveClass("small", "text-body-secondary");
  });
});

describe("CenterState", () => {
  it("shows a spinner while loading and an alert on error", () => {
    const { rerender } = render(<CenterState title="Reading…" loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reading…" })).toBeInTheDocument();

    rerender(
      <CenterState title="Failed" error>
        boom
      </CenterState>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
  });
});

describe("DeltaBadge", () => {
  it("labels new, up, down, and flat deltas", () => {
    const { rerender } = render(<DeltaBadge pct={null} />);
    expect(screen.getByText("new")).toBeInTheDocument();

    rerender(<DeltaBadge pct={12.4} />);
    expect(screen.getByText("+12%")).toBeInTheDocument();

    rerender(<DeltaBadge pct={-8.1} />);
    expect(screen.getByText("−8%")).toBeInTheDocument();

    rerender(<DeltaBadge pct={0.1} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("BarRow", () => {
  it("clamps the bar and highlights the active row", () => {
    render(<BarRow label="Groceries" amount="$40" pct={150} active />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$40")).toBeInTheDocument();
    const bar = document.querySelector(".progress-bar");
    expect(bar).toHaveStyle({ width: "100%" });
    expect(bar.closest(".d-flex")).toHaveClass("bg-success-subtle");
  });
});

describe("Eyebrow alone", () => {
  it("accepts an extra className", () => {
    render(<Eyebrow className="ms-1">Only</Eyebrow>);
    expect(screen.getByText("Only")).toHaveClass("ms-1");
  });
});
