import React from "react";
import { Alert, Badge, Card, ProgressBar, Spinner, Table } from "react-bootstrap";

/** Right-aligned monospace money. */
export const num = "text-end font-monospace text-nowrap";

const kickerStyle = { fontSize: "0.68rem", letterSpacing: "0.14em" };

export function Eyebrow({ children, className = "" }) {
  return (
    <span className={`text-uppercase fw-semibold text-body-secondary ${className}`} style={kickerStyle}>
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, lede, next, children, className = "" }) {
  return (
    <header className={`mb-4 ${className}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {title != null ? <h1 className="section-title display-5 fw-medium mt-2 mb-0">{title}</h1> : null}
      {lede != null ? <p className="section-lede lead fst-italic mt-3 mb-0">{lede}</p> : null}
      {next != null ? <p className="section-next small font-monospace text-body-secondary mt-3 mb-0">{next}</p> : null}
      {children}
    </header>
  );
}

export function Panel({ eyebrow, extra, children, id, alarm = false, className = "" }) {
  return (
    <Card id={id} className={`mb-3 ${alarm ? "border-danger" : ""} ${className}`}>
      {(eyebrow || extra) && (
        <Card.Header className="d-flex justify-content-between align-items-baseline gap-2 bg-body-tertiary">
          <Eyebrow>{eyebrow}</Eyebrow>
          {extra ? <div className="text-end">{extra}</div> : null}
        </Card.Header>
      )}
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}

export function Kpis({ children, className = "row-cols-2 row-cols-md-4" }) {
  return <div className={`row g-3 ${className}`}>{children}</div>;
}

export function Kpi({ label, value, tone, hint }) {
  return (
    <div className="col">
      <Eyebrow>{label}</Eyebrow>
      <div className={`fs-5 font-monospace ${toneClass(tone)}`}>{value}</div>
      {hint ? <div className="small text-body-secondary">{hint}</div> : null}
    </div>
  );
}

export function DataTable({ children, className = "", maxHeight }) {
  return (
    <div className="table-responsive" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
      <Table size="sm" hover className={`align-middle mb-0 ${className}`}>
        {children}
      </Table>
    </div>
  );
}

export function Foot({ children }) {
  return <p className="small text-body-secondary mt-3 mb-0">{children}</p>;
}

export function CenterState({ title, children, loading = false, error = false }) {
  return (
    <div className="text-center py-5 px-3 mx-auto" style={{ maxWidth: 480 }}>
      {loading ? (
        <Spinner animation="border" variant="primary" className="mb-3" role="status">
          <span className="visually-hidden">Loading</span>
        </Spinner>
      ) : null}
      {title ? <h2 className="h4 fw-medium">{title}</h2> : null}
      {error ? <Alert variant="danger" className="text-start mt-3">{children}</Alert> : children}
    </div>
  );
}

export function DeltaBadge({ pct }) {
  if (pct == null) {
    return <Badge bg="secondary-subtle" text="secondary-emphasis">new</Badge>;
  }
  const r = Math.round(pct);
  if (pct > 0.5) {
    return (
      <Badge bg="danger-subtle" text="danger-emphasis">
        {`${r > 0 ? "+" : ""}${r}%`}
      </Badge>
    );
  }
  if (pct < -0.5) {
    const text = `${r < 0 ? "−" : ""}${Math.abs(r)}%`;
    return <Badge bg="success-subtle" text="success-emphasis">{text}</Badge>;
  }
  return <Badge bg="secondary-subtle" text="secondary-emphasis">—</Badge>;
}

export function BarRow({ label, amount, pct, extra, active = false }) {
  return (
    <div className={`d-flex align-items-center gap-2 py-1 min-w-0 ${active ? "bg-success-subtle rounded px-2" : ""}`}>
      <div className="text-truncate flex-shrink-1" style={{ flexBasis: "7rem" }}>{label}</div>
      <div className="flex-grow-1 min-w-0">
        <ProgressBar
          now={Math.max(0, Math.min(100, pct))}
          variant={active ? "success" : "secondary"}
          style={{ height: 8 }}
          aria-hidden
        />
      </div>
      <span className="font-monospace small text-nowrap">{amount}</span>
      {extra}
    </div>
  );
}

export function toneClass(tone) {
  if (tone === "neg") return "text-danger";
  if (tone === "pos") return "text-success";
  return "";
}
