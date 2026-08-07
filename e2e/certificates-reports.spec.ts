import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("a learner who completed a course can view their certificate", async ({
  page,
}) => {
  // Sara completed a course in the seed, so she has a certificate.
  await login(page, "alarrab", "sara@alarrab.bcap");
  await page.goto("/training");
  await page.getByRole("link", { name: /certificate/i }).first().click();
  await expect(page).toHaveURL(/\/certificate$/);
  await expect(
    page.getByRole("heading", { name: /certificate of completion/i })
  ).toBeVisible();
  await expect(page.getByText(/Sara/).first()).toBeVisible();
  await expect(page.getByText(/BCAP-/).first()).toBeVisible(); // serial
});

test("a manager sees the monthly development report and each employee's certificate", async ({
  page,
}) => {
  await login(page, "alarrab", "huda@alarrab.bcap"); // HR manager: report.view

  await page.goto("/training");
  await page.getByRole("link", { name: /^Reports$/ }).click();
  await expect(page).toHaveURL(/\/training\/reports/);
  await expect(
    page.getByRole("heading", { name: /development report/i })
  ).toBeVisible();

  // KPI columns and the engaged employee are shown; open her detail.
  await expect(page.getByText(/KPI/).first()).toBeVisible();
  await page.getByRole("link", { name: /Sara/ }).first().click();
  await expect(page).toHaveURL(/\/training\/reports\/[^/]+$/);
  await expect(page.getByText(/certificates/i).first()).toBeVisible();

  // Open the employee's certificate from the manager view.
  await page.getByRole("link", { name: /view certificate/i }).first().click();
  await expect(
    page.getByRole("heading", { name: /certificate of completion/i })
  ).toBeVisible();
});
