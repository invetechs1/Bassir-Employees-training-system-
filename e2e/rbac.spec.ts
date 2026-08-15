import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("an employee cannot reach AI Insights (redirected away)", async ({ page }) => {
  await login(page, "alarrab", "sara@alarrab.bcap");
  await page.goto("/insights");
  // Employees lack report.view -> redirected off the insights route.
  await expect(page).not.toHaveURL(/\/insights$/);
});

test("an employee does not see the People nav item", async ({ page }) => {
  await login(page, "alarrab", "sara@alarrab.bcap");
  await expect(page.getByRole("link", { name: /^people$/i })).toHaveCount(0);
});

test("HR manager can open the People directory", async ({ page }) => {
  await login(page, "alarrab", "huda@alarrab.bcap");
  await page.getByRole("link", { name: /people/i }).click();
  await expect(page).toHaveURL(/\/people/);
  // HR can manage people -> the invite button is present.
  await expect(page.getByRole("button", { name: /add employee/i })).toBeVisible();
});
