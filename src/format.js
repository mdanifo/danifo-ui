// Money formatting shared by the dashboards.
//
// Building the Intl.NumberFormat is most of what `toLocaleString` costs, and a
// table of money cells calls it per cell per render, so one formatter per
// style is kept. Non-numbers (strings, bigints) go through toLocaleString.

const USD = { style: "currency", currency: "USD", minimumFractionDigits: 2 };
const USD0 = { style: "currency", currency: "USD", maximumFractionDigits: 0 };

const formatters = new Map();

function format(n, options) {
  const value = n ?? 0;
  if (typeof value !== "number") return value.toLocaleString("en-US", options);
  let formatter = formatters.get(options);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", options);
    formatters.set(options, formatter);
  }
  return formatter.format(value);
}

export const usd = (n) => format(n, USD);

export const usd0 = (n) => format(n, USD0);

// "$13,955–14,556", or one figure when both ends round the same. Word joiners
// around the dash keep a range from breaking across two lines.
export function usdRange([lo, hi]) {
  const a = usd0(lo);
  const b = usd0(hi);
  return a === b ? a : `${a}⁠–⁠${b.replace("$", "")}`;
}
