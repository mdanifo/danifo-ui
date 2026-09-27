// Money formatting shared by the dashboards.

export const usd = (n) =>
  (n ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export const usd0 = (n) =>
  (n ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// "$13,955–14,556", or one figure when both ends round the same. Word joiners
// around the dash keep a range from breaking across two lines.
export function usdRange([lo, hi]) {
  const a = usd0(lo);
  const b = usd0(hi);
  return a === b ? a : `${a}⁠–⁠${b.replace("$", "")}`;
}
