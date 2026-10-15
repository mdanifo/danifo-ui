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

  it("renders only what it is given", () => {
    render(<PageHeader className="pt-2" />);
    const header = document.querySelector("header");
    expect(header).toHaveClass("mb-4", "pt-2");
    expect(header).toBeEmptyDOMElement();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("keeps a title of 0 and an empty lede (only null and undefined are absent)", () => {
    render(<PageHeader title={0} lede="" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("0");
    expect(document.querySelector(".section-lede")).toBeInTheDocument();
    expect(document.querySelector(".section-next")).toBeNull();
  });
});

describe("Eyebrow alone", () => {
  it("accepts an extra className", () => {
    render(<Eyebrow className="ms-1">Only</Eyebrow>);
    expect(screen.getByText("Only")).toHaveClass("ms-1", "text-uppercase", "fw-semibold");
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

  it("has no header without an eyebrow or extra, and no alarm border by default", () => {
    render(<Panel className="shadow">plain</Panel>);
    const card = screen.getByText("plain").closest(".card");
    expect(card).toHaveClass("mb-3", "shadow");
    expect(card).not.toHaveClass("border-danger");
    expect(card.querySelector(".card-header")).toBeNull();
  });

  it("shows a header for an eyebrow alone, without the extra slot", () => {
    render(<Panel eyebrow="Taxes">body</Panel>);
    const header = document.querySelector(".card-header");
    expect(header).toHaveTextContent("Taxes");
    expect(header.querySelector(".text-end")).toBeNull();
  });

  it("shows a header for an extra alone", () => {
    render(<Panel extra={<button type="button">act</button>}>body</Panel>);
    const header = document.querySelector(".card-header");
    expect(header).toContainElement(screen.getByRole("button", { name: "act" }));
    expect(header.querySelector(".text-end")).toBeInTheDocument();
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

  it("lays out two per row on phones and four from md unless told otherwise", () => {
    const { rerender } = render(<Kpis>k</Kpis>);
    expect(screen.getByText("k")).toHaveClass("row", "g-3", "row-cols-2", "row-cols-md-4");

    rerender(<Kpis className="row-cols-3">k</Kpis>);
    expect(screen.getByText("k")).toHaveClass("row-cols-3");
    expect(screen.getByText("k")).not.toHaveClass("row-cols-2");
  });

  it("renders a plain value without a tone or hint", () => {
    render(<Kpi label="Net" value="$0" />);
    const value = screen.getByText("$0");
    expect(value).toHaveClass("dui-kpi-value", "fs-5", "font-monospace");
    expect(value).not.toHaveClass("text-success");
    expect(value).not.toHaveClass("text-danger");
    expect(value.parentElement.querySelector(".small")).toBeNull();
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
    expect(document.querySelector(".table-responsive")).toHaveStyle({ maxHeight: "120px", overflowY: "auto" });
    expect(screen.getByRole("table")).toHaveClass("table", "table-sm", "table-hover", "align-middle", "mb-0", "data-table");
    expect(screen.getByText("$1")).toHaveClass("font-monospace", "text-end");
    expect(num).toContain("font-monospace");
    expect(toneClass("pos")).toBe("text-success");
    expect(toneClass("neg")).toBe("text-danger");
    expect(toneClass()).toBe("");
  });

  it("only scrolls sideways when no height is given", () => {
    render(
      <DataTable>
        <tbody />
      </DataTable>,
    );
    const wrap = document.querySelector(".table-responsive");
    expect(wrap).not.toHaveAttribute("style");
  });

  it("renders a foot note", () => {
    render(<Foot>Source: ledger</Foot>);
    expect(screen.getByText("Source: ledger")).toHaveClass("small", "text-body-secondary");
  });
});

describe("CenterState", () => {
  it("shows a spinner while loading and an alert on error", () => {
    const { rerender } = render(<CenterState title="Reading..." loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reading..." })).toBeInTheDocument();

    rerender(
      <CenterState title="Failed" error>
        boom
      </CenterState>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
  });

  it("is plain centred copy by default", () => {
    render(<CenterState>Nothing here yet.</CenterState>);
    expect(screen.getByText("Nothing here yet.")).toHaveClass("text-center");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });
});

describe("DeltaBadge", () => {
  it("labels new, up, down, and flat deltas", () => {
    const { rerender } = render(<DeltaBadge pct={null} />);
    expect(screen.getByText("new")).toBeInTheDocument();

    rerender(<DeltaBadge pct={12.4} />);
    expect(screen.getByText("+12%")).toHaveClass("bg-danger-subtle", "text-danger-emphasis");

    rerender(<DeltaBadge pct={-8.1} />);
    expect(screen.getByText("−8%")).toHaveClass("bg-success-subtle", "text-success-emphasis");

    rerender(<DeltaBadge pct={0.1} />);
    expect(screen.getByText("—")).toHaveClass("bg-secondary-subtle");
  });

  it("treats half a percent either way as flat, and rounds the rest", () => {
    const { rerender } = render(<DeltaBadge pct={0.5} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    rerender(<DeltaBadge pct={-0.5} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    rerender(<DeltaBadge pct={0.51} />);
    expect(screen.getByText("+1%")).toBeInTheDocument();
    rerender(<DeltaBadge pct={-0.51} />);
    expect(screen.getByText("−1%")).toBeInTheDocument();
    rerender(<DeltaBadge pct={250} />);
    expect(screen.getByText("+250%")).toBeInTheDocument();
    rerender(<DeltaBadge pct={-100} />);
    expect(screen.getByText("−100%")).toBeInTheDocument();
    rerender(<DeltaBadge />);
    expect(screen.getByText("new")).toBeInTheDocument();
  });
});

describe("BarRow", () => {
  it("clamps the bar and highlights the active row", () => {
    render(<BarRow label="Groceries" amount="$40" pct={150} active />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$40")).toBeInTheDocument();
    const bar = document.querySelector(".progress-bar");
    expect(bar).toHaveStyle({ width: "100%" });
    expect(bar).toHaveClass("bg-success");
    expect(bar.closest(".d-flex")).toHaveClass("bg-success-subtle");
  });

  it("is a plain grey row by default, with the extra after the amount", () => {
    render(<BarRow label="Dining" amount="$21" pct={-20} extra={<span>tag</span>} />);
    const bar = document.querySelector(".progress-bar");
    expect(bar).toHaveStyle({ width: "0%" });
    expect(bar).toHaveClass("bg-secondary");
    const row = bar.closest(".d-flex");
    expect(row).not.toHaveClass("bg-success-subtle");
    expect(row.lastElementChild).toHaveTextContent("tag");
    expect(bar.closest(".progress")).toHaveAttribute("aria-hidden", "true");
  });

  it("draws an empty bar for a missing or NaN share", () => {
    const { rerender } = render(<BarRow label="Unknown" amount="—" />);
    expect(document.querySelector(".progress-bar")).toHaveStyle({ width: "0%" });
    rerender(<BarRow label="Unknown" amount="—" pct={NaN} />);
    expect(document.querySelector(".progress-bar")).toHaveStyle({ width: "0%" });
    rerender(<BarRow label="Half" amount="—" pct={50} />);
    expect(document.querySelector(".progress-bar")).toHaveStyle({ width: "50%" });
  });
});
