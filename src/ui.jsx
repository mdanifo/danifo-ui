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

/**
 * A row of Kpi tiles: a grid that fits as many as the row is wide, each at
 * least `min` wide (default 9rem, set in the stylesheet), measured against the
 * row itself rather than the viewport.
 */
export function Kpis({ children, className = "", min }) {
  return (
    <div className={`dui-kpis ${className}`} style={min ? { "--dui-kpi-min": min } : undefined}>
      {children}
    </div>
  );
}

/**
 * One figure with its label. `delta` is a percent change, shown as a
 * DeltaBadge (a number; null means "new"), or any element to show in its
 * place; `deltaGoodWhen` says which direction is good ("down" by default, as
 * for spending). `spark` is a small chart drawn under the figure, hidden from
 * assistive tech: the figure and delta carry the meaning.
 */
export function Kpi({ label, value, tone, hint, delta, deltaGoodWhen = "down", spark }) {
  let badge = null;
  if (typeof delta === "number" || delta === null) badge = <DeltaBadge pct={delta} goodWhen={deltaGoodWhen} />;
  else if (delta !== undefined) badge = delta;
  return (
    <div className="dui-kpi">
      <Eyebrow>{label}</Eyebrow>
      <div className={`dui-kpi-value ${toneClass(tone)}`}>
        {value}
        {badge ? <span className="dui-kpi-delta">{badge}</span> : null}
      </div>
      {spark ? (
        <div className="dui-kpi-spark" aria-hidden="true">
          {spark}
        </div>
      ) : null}
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

/**
 * A percent change. A rise is bad by default (spending, debt); pass
 * `goodWhen="up"` for income, balances and returns.
 */
export function DeltaBadge({ pct, goodWhen = "down" }) {
  if (pct == null) {
    return <Badge bg="secondary-subtle" text="secondary-emphasis">new</Badge>;
  }
  // Past half a percent the rounded figure is at least 1 either way, so the
  // sign is always there to show.
  const r = Math.round(pct);
  const up = pct > 0.5;
  const down = pct < -0.5;
  if (!up && !down) {
    return <Badge bg="secondary-subtle" text="secondary-emphasis">—</Badge>;
  }
  const good = goodWhen === "up" ? up : down;
  const tone = good ? "success" : "danger";
  return <Badge bg={`${tone}-subtle`} text={`${tone}-emphasis`}>{up ? `+${r}%` : `−${-r}%`}</Badge>;
}

export function BarRow({ label, amount, pct, extra, active = false }) {
  // A missing or NaN share draws an empty bar instead of an invalid width.
  const now = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
  return (
    <div className={`d-flex align-items-center gap-2 py-1 min-w-0 ${active ? "bg-success-subtle rounded px-2" : ""}`}>
      <div className="text-truncate flex-shrink-1" style={{ flexBasis: "7rem" }}>{label}</div>
      <div className="flex-grow-1 min-w-0">
        <ProgressBar
          now={now}
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

/**
 * A Panel's eyebrow is a span, not a heading. Where the label names a section
 * people jump between, wrap it in this so screen readers and keyboard users
 * get a heading without the look changing:
 *   <Panel eyebrow={<PanelHeading>Treadmill console</PanelHeading>}>
 */
export function PanelHeading({ level = 2, children }) {
  return (
    <span role="heading" aria-level={level}>
      {children}
    </span>
  );
}

/**
 * A placeholder the shape of the content that is coming, instead of a spinner
 * and "Loading…": the page keeps its layout while it waits, so nothing jumps
 * when the data lands. Hidden from assistive tech; the live content announces
 * itself.
 */
export function Skeleton({ lines = 3, cards = 1, className = "mb-3" }) {
  return (
    <div aria-hidden="true" data-testid="skeleton">
      {Array.from({ length: cards }, (_, c) => (
        <Card key={c} className={className}>
          <Card.Body className="placeholder-glow">
            {Array.from({ length: lines }, (_, i) => (
              <span
                key={i}
                className={`placeholder d-block mb-2 col-${i === 0 ? 5 : i % 3 === 0 ? 7 : 9}`}
              />
            ))}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export function toneClass(tone) {
  if (tone === "neg") return "text-danger";
  if (tone === "pos") return "text-success";
  if (tone === "warn") return "text-warning-emphasis";
  return "";
}
