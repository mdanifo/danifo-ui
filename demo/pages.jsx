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
        <Kpi label="Cash" value={usd0(22791)} tone="pos" hint="checking + savings" />
        <Kpi label="Cards" value={usd0(-1284)} tone="neg" hint="due the 14th" />
        <Kpi label="Loans" value={usd0(-315713)} />
        <Kpi label="Net" value={usd0(-124126)} tone="neg" />
      </Kpis>
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
      <Panel eyebrow="States" alarm>
        <CenterState title="Loading" loading>
          Reading the ledger…
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
