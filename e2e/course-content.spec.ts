import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("learner can open a seeded course, complete a lesson, and see progress", async ({
  page,
}) => {
  await login(page, "alarrab", "omar@alarrab.bcap");

  // Open the starter Accounting course from the catalog.
  await page.goto("/training");
  await page
    .getByRole("link", { name: /Financial Fundamentals for Accountants/i })
    .first()
    .click();

  // Program detail page shows modules/lessons and a start action.
  await expect(page).toHaveURL(/\/training\/[^/]+$/);
  await expect(page.getByText(/your progress/i)).toBeVisible();
  await page.getByRole("link", { name: /start course/i }).click();

  // Lesson player: mark the lesson complete.
  await expect(page).toHaveURL(/\/training\/[^/]+\/[^/]+$/);
  await page.getByRole("button", { name: /^mark as complete$/i }).click();

  // The toggle flips, confirming the completion was recorded.
  await expect(
    page.getByRole("button", { name: /mark as not complete/i })
  ).toBeVisible();

  // Back on the program page, derived progress is now non-zero.
  await page.getByRole("link", { name: /financial fundamentals/i }).click();
  await expect(page).toHaveURL(/\/training\/[^/]+$/);
  await expect(page.getByText(/\b[1-9]\d?%/).first()).toBeVisible();
});
