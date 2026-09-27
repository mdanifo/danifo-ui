import { describe, expect, it } from "vitest";
import { usd, usd0, usdRange } from "./format.js";

describe("money", () => {
  it("formats cents and whole dollars", () => {
    expect(usd(4541)).toBe("$4,541.00");
    expect(usd0(4541.4)).toBe("$4,541");
  });
  it("joins a range so it cannot wrap at the dash", () => {
    expect(usdRange([13955.37, 14555.87])).toBe("$13,955⁠–⁠14,556");
    expect(usdRange([10, 10.2])).toBe("$10");
  });
});
