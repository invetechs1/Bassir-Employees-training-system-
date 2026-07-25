import { describe, it, expect } from "vitest";
import {
  normalizeHex,
  safeLogoUrl,
  brandingOf,
  DEFAULT_BRAND_COLOR,
} from "../branding";

describe("branding", () => {
  it("accepts valid hex and rejects invalid", () => {
    expect(normalizeHex("#2953d9")).toBe("#2953d9");
    expect(normalizeHex("#abc")).toBe("#abc");
    expect(normalizeHex("blue")).toBe(DEFAULT_BRAND_COLOR);
    expect(normalizeHex("")).toBe(DEFAULT_BRAND_COLOR);
    expect(normalizeHex(null)).toBe(DEFAULT_BRAND_COLOR);
    expect(normalizeHex("#12")).toBe(DEFAULT_BRAND_COLOR);
  });

  it("only allows http(s) logo URLs", () => {
    expect(safeLogoUrl("https://x.com/logo.png")).toBe("https://x.com/logo.png");
    expect(safeLogoUrl("http://x.com/l.svg")).toBe("http://x.com/l.svg");
    expect(safeLogoUrl("javascript:alert(1)")).toBeNull();
    expect(safeLogoUrl("ftp://x/y")).toBeNull();
    expect(safeLogoUrl(null)).toBeNull();
  });

  it("derives branding with initial + defaults", () => {
    const b = brandingOf({ name: "Acme Contracting", brandColor: null, logoUrl: null });
    expect(b.color).toBe(DEFAULT_BRAND_COLOR);
    expect(b.initial).toBe("A");
    expect(b.logoUrl).toBeNull();
  });
});
