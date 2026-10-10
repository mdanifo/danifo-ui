import { describe, expect, it, vi } from "vitest";
import { usd, usd0, usdRange } from "./format.js";

const USD = { style: "currency", currency: "USD", minimumFractionDigits: 2 };
const USD0 = { style: "currency", currency: "USD", maximumFractionDigits: 0 };

describe("money", () => {
  it("formats cents and whole dollars", () => {
    expect(usd(4541)).toBe("$4,541.00");
    expect(usd0(4541.4)).toBe("$4,541");
  });

  it("treats a missing value as zero", () => {
    expect(usd(null)).toBe("$0.00");
    expect(usd(undefined)).toBe("$0.00");
    expect(usd0(null)).toBe("$0");
  });

  it("keeps the sign and rounds half away from zero", () => {
    expect(usd(-5)).toBe("-$5.00");
    expect(usd0(2.5)).toBe("$3");
    expect(usd0(-2.5)).toBe("-$3");
    expect(usd0(1234567.89)).toBe("$1,234,568");
    expect(usd(0.005)).toBe("$0.01");
  });

  it("prints exactly what toLocaleString prints, for any number", () => {
    const samples = [0, -0, 0.1 + 0.2, 1.005, 2.675, -1283.555, 999999.999, 1e9, 1e21, 7 / 3, Number.MAX_SAFE_INTEGER];
    for (const n of samples) {
      expect(usd(n)).toBe(n.toLocaleString("en-US", USD));
      expect(usd0(n)).toBe(n.toLocaleString("en-US", USD0));
    }
    expect(usd(NaN)).toBe(NaN.toLocaleString("en-US", USD));
    expect(usd0(Infinity)).toBe(Infinity.toLocaleString("en-US", USD0));
  });

  it("leaves a non-number to its own toLocaleString, as before", () => {
    // A string is returned untouched (String#toLocaleString ignores options),
    // and a bigint is formatted as money.
    expect(usd("12")).toBe("12");
    expect(usd0(12n)).toBe((12n).toLocaleString("en-US", USD0));
  });

  it("builds one formatter per style and reuses it", async () => {
    vi.resetModules();
    const spy = vi.spyOn(Intl, "NumberFormat");
    try {
      const fresh = await import("./format.js");
      fresh.usd(1);
      fresh.usd(2);
      fresh.usd0(3);
      fresh.usd0(4);
      fresh.usdRange([5, 6]);
      expect(spy).toHaveBeenCalledTimes(2);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("usdRange", () => {
  it("joins a range so it cannot wrap at the dash", () => {
    expect(usdRange([13955.37, 14555.87])).toBe("$13,955⁠–⁠14,556");
    expect(usdRange([10, 10.2])).toBe("$10");
  });

  it("wraps the en dash in word joiners and drops the second dollar sign", () => {
    expect(usdRange([1, 2])).toBe("$1⁠–⁠2");
    expect(usdRange([0, 1])).toBe("$0⁠–⁠1");
  });

  it("collapses to one figure when both ends round the same", () => {
    expect(usdRange([0, 0.4])).toBe("$0");
    expect(usdRange([99.5, 100.4])).toBe("$100");
  });

  it("keeps a negative low end readable", () => {
    expect(usdRange([-5, 5])).toBe("-$5⁠–⁠5");
  });
});
