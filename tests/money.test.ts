import { describe, it, expect } from "vitest";
import { toCents, fromCents, formatDA, formatDAShort } from "@/lib/money";

// Intl.NumberFormat inserts a narrow no-break space (U+202F) as the
// thousands separator; normalize to a plain space for readable assertions.
function normalizeSpaces(s: string): string {
  return s.replace(/ /g, " ");
}

describe("money utilities", () => {
  it("converts DA to cents", () => {
    expect(toCents(150)).toBe(15000);
    expect(toCents(19.99)).toBe(1999);
  });

  it("rounds fractional centimes when converting to cents", () => {
    expect(toCents(10.005)).toBe(1001);
  });

  it("converts cents back to DA", () => {
    expect(fromCents(15000)).toBe(150);
    expect(fromCents(1999)).toBe(19.99);
  });

  it("formats amounts with two decimals and DA suffix", () => {
    expect(formatDA(150000)).toBe("1 500,00 DA");
    expect(formatDA(0)).toBe("0,00 DA");
  });

  it("formats short amounts without decimals", () => {
    expect(formatDAShort(150000)).toBe("1 500 DA");
  });
});
