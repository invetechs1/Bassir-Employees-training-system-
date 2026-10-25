import { randomInt } from "crypto";

// Ambiguous characters (0/O, 1/l/I) removed so temp passwords are easy to read
// aloud or copy from a screen.
const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const ALL = UPPER + LOWER + DIGITS;

/**
 * Generate a readable temporary password that satisfies the 8+ character
 * policy and always contains an uppercase letter, a lowercase letter and a
 * digit. Used when an admin invites an employee or resets a password.
 */
export function generateTempPassword(length = 10): string {
  const chars: string[] = [
    UPPER[randomInt(UPPER.length)],
    LOWER[randomInt(LOWER.length)],
    DIGITS[randomInt(DIGITS.length)],
  ];
  for (let i = chars.length; i < length; i++) {
    chars.push(ALL[randomInt(ALL.length)]);
  }
  // Fisher–Yates shuffle so the guaranteed characters aren't always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
