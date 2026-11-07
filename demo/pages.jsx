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
  usd,
  usd0,
  usdRange,
} from "@danifo/ui";

/** A sparkline for a Kpi: one series colour from the chart tokens, 2px, no axes. */
function Spark({ points, series = 1 }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = 100 / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(28 - ((p - min) / (max - min || 1)) * 26 + 1).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" data-testid="spark">
      <path d={d} fill="none" stroke={`var(--dui-series-${series})`} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

const SERIES = ["blue", "orange", "aqua", "yellow", "magenta", "green"];

const ACCOUNTS = [
  ["Checking", "Joint", "Cash", "2019-03-02", "0.01%", 0, 4541.2, null, 4541.2],
  ["Savings", "Joint", "Cash", "2019-03-02", "4.10%", 0, 18250, null, 18250],
  ["Visa", "M", "Card", "2021-08-14", "21.99%", 35, -1283.55, 12000, 10716.45],
  ["Auto loan", "M", "Loan", "2023-01-20", "5.49%", 412.18, -14212.9, null, 0],
  ["Mortgage", "Joint", "Loan", "2020-06-30", "2.875%", 1875.4, -301500, null, 0],
  ["Brokerage", "M", "Invest", "2018-11-11", "", 0, 42110.07, null, 42110.07],
  ["401(k)", "M", "Retire", "2016-05-01", "", 0, 118400.5, null, 0],
  ["HSA", "M", "Health", "2022-02-02", "", 0, 3120, null, 3120],
];

export function HomePage({ layout }) {
  return (
    <>
      <PageHeader
        eyebrow="Demo"
        title={`The ${layout} layout`}
        lede="One shell, three shapes: a drawer everywhere, a sidebar from lg, or a phone tab bar."
        next="Next: open the menu, switch the theme, resize the window."
      />
      <Kpis>
        <Kpi
          label="Cash"
          value={usd0(22791)}
          tone="pos"
          hint="checking + savings"
          delta={3.2}
          deltaGoodWhen="up"
          spark={<Spark points={[18.1, 19.4, 19.0, 20.2, 21.5, 21.1, 22.8]} />}
        />
        <Kpi label="Cards" value={usd0(-1284)} tone="neg" hint="due the 14th" delta={-8.1} />
        <Kpi label="Loans" value={usd0(-315713)} delta={0.2} />
        <Kpi label="Net" value={usd0(-124126)} tone="neg" delta={null} />
      </Kpis>
      <Panel eyebrow="A figure in a panel" className="mt-3">
        <p>
          A Panel is a Bootstrap card, which breaks any word that cannot fit. A KPI figure is exempt: it
          overflows its column rather than splitting mid-number.
        </p>
        <div className="row g-3">
          <div className="col-auto" style={{ width: "8rem" }} data-testid="kpi-range">
            <Kpi label="Projected" value={usdRange([13955.37, 14555.87])} />
          </div>
        </div>
      </Panel>
      {/* Outside a Panel on purpose: Bootstrap's .card sets overflow-wrap:
          break-word, which force-breaks anything that cannot fit at all. */}
      <section className="mt-4" aria-label="Range">
        <Eyebrow>Range</Eyebrow>
        <p className="mt-1">
          A money range moves to the next line whole instead of breaking at its dash (the right box is a
          plain dash, for contrast):
        </p>
        <div className="d-flex gap-3 font-monospace">
          <div className="border rounded p-2" style={{ width: "7rem" }}>
            <span data-testid="range">{usdRange([13955.37, 14555.87])}</span>
          </div>
          <div className="border rounded p-2" style={{ width: "7rem" }}>
            <span data-testid="range-naive">$13,955–14,556</span>
          </div>
        </div>
      </section>
    </>
  );
}

export function ComponentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Page chrome"
        lede="Everything an app gets from @danifo/ui, on the real theme."
      />
      <Panel eyebrow="Ledger" extra={<DeltaBadge pct={12.4} />} id="ledger">
        <DataTable maxHeight={260} className="demo-ledger">
          <thead>
            <tr>
              <th>Account</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Opened</th>
              <th>Rate</th>
              <th className={num}>Minimum</th>
              <th className={num}>Balance</th>
              <th className={num}>Limit</th>
              <th className={num}>Available</th>
            </tr>
          </thead>
          <tbody>
            {ACCOUNTS.map(([name, owner, type, opened, rate, min, bal, limit, avail]) => (
              <tr key={name}>
                <td className="text-nowrap">{name}</td>
                <td>{owner}</td>
                <td>{type}</td>
                <td className="text-nowrap">{opened}</td>
                <td>{rate}</td>
                <td className={num}>{usd(min)}</td>
                <td className={num}>{usd(bal)}</td>
                <td className={num}>{limit == null ? "—" : usd0(limit)}</td>
                <td className={num}>{usd(avail)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <Foot>Nine columns: the table scrolls inside its panel, the page does not.</Foot>
      </Panel>
      <Panel eyebrow="Categories" extra={<span className="small">of {usd0(1000)}</span>}>
        <BarRow label="Groceries" amount={usd0(640)} pct={64} active extra={<DeltaBadge pct={-8.1} />} />
        <BarRow label="Dining" amount={usd0(210)} pct={21} extra={<DeltaBadge pct={0.2} />} />
        <BarRow
          label="A very long category label that has to truncate on a phone"
          amount={usd0(90)}
          pct={9}
          extra={<DeltaBadge pct={null} />}
        />
      </Panel>
      <Panel eyebrow="Chart palette" extra={<span className="small">assign in order, never cycle</span>}>
        <div className="d-flex flex-wrap gap-3" data-testid="palette">
          {SERIES.map((name, i) => (
            <div key={name} className="d-flex align-items-center gap-2 small">
              <span
                className="rounded-2 d-inline-block"
                style={{ width: 28, height: 28, background: `var(--dui-series-${i + 1})` }}
                data-testid={`series-${i + 1}`}
              />
              <span className="font-monospace">{i + 1}</span> {name}
            </div>
          ))}
        </div>
        <Foot>Six slots per theme, validated for colour-vision deficiency on the base surfaces. Slots 3 to 5 need labels on light.</Foot>
      </Panel>
      <Panel eyebrow="States" alarm>
        <CenterState title="Loading" loading>
          Reading the ledger...
        </CenterState>
        <CenterState title="Failed" error>
          Could not reach the API.
        </CenterState>
      </Panel>
    </>
  );
}

const PARAGRAPH =
  "Scroll past the fold: the header stays put at the top and, on a phone with the tab bar, nothing ends underneath the bar. ";

export function LongPage() {
  return (
    <>
      <PageHeader eyebrow="Scrolling" title="A long page" />
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i}>
          {i + 1}. {PARAGRAPH.repeat(3)}
        </p>
      ))}
      <Foot>
        <span data-testid="last-line">The last line.</span>
      </Foot>
    </>
  );
}
