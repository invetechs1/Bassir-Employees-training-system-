import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("learner can take a course quiz, pass it, and complete the lesson", async ({
  page,
}) => {
  await login(page, "alarrab", "huda@alarrab.bcap");

  // Open the Accounting course and its knowledge-check quiz.
  await page.goto("/training");
  await page
    .getByRole("link", { name: /Financial Fundamentals for Accountants/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/training\/[^/]+$/);
  await page.getByRole("link", { name: /Course Quiz/ }).click();

  // Quiz player loaded.
  await expect(page).toHaveURL(/\/training\/[^/]+\/[^/]+$/);
  await expect(page.getByRole("button", { name: /submit answers/i })).toBeVisible();

  // Choose the correct answer for each seeded question (by visible label text).
  for (const answer of [
    "15%",
    "Liabilities + Equity",
    "A scannable QR code",
    "It is earned",
  ]) {
    await page.locator("label", { hasText: answer }).click();
  }

  await page.getByRole("button", { name: /submit answers/i }).click();

  // Passed banner appears and the lesson is now recorded as passed.
  await expect(page.getByText(/passed/i).first()).toBeVisible();
  await expect(page.getByText(/100%/).first()).toBeVisible();
});
