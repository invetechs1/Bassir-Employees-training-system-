import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("admin can view and manage department training tracks", async ({ page }) => {
  await login(page, "azoom", "admin@azoom.bcap");

  // Reach the department-tracks admin page from the training header.
  await page.goto("/training");
  await page.getByRole("link", { name: /department tracks/i }).click();
  await expect(page).toHaveURL(/\/training\/departments$/);

  // Seeded departments and their mapped tracks are shown.
  await expect(
    page.getByRole("heading", { name: /department training tracks/i })
  ).toBeVisible();
  await expect(page.getByText("HSE", { exact: true })).toBeVisible();
  await expect(page.getByText("Procurement", { exact: true })).toBeVisible();

  // The HSE row's track select is pre-set to the Health, Safety & Environment track.
  const hseRow = page.getByRole("row", { name: /HSE/ });
  await expect(hseRow.getByRole("combobox")).toHaveValue("Health, Safety & Environment");

  // Backfill existing members for a mapped department.
  await hseRow.getByRole("button", { name: /assign now/i }).click();
  await expect(page).toHaveURL(/\/training\/departments$/);
});
