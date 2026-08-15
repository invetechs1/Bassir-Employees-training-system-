import { describe, it, expect } from "vitest";
import { generateTempPassword } from "../temp-password";

describe("generateTempPassword", () => {
  it("meets the length and complexity policy", () => {
    for (let i = 0; i < 50; i++) {
      const pw = generateTempPassword();
      expect(pw.length).toBeGreaterThanOrEqual(8);
      expect(pw).toMatch(/[A-Z]/); // uppercase
      expect(pw).toMatch(/[a-z]/); // lowercase
      expect(pw).toMatch(/[0-9]/); // digit
      // no ambiguous characters
      expect(pw).not.toMatch(/[0O1lI]/);
    }
  });

  it("honors a custom length", () => {
    expect(generateTempPassword(20)).toHaveLength(20);
  });

  it("is effectively unique", () => {
    const set = new Set(Array.from({ length: 100 }, () => generateTempPassword()));
    expect(set.size).toBe(100);
  });
});
