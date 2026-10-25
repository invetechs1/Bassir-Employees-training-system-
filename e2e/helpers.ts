import { type Page, expect } from "@playwright/test";

/** Sign in to a tenant workspace via the login form. */
export async function login(
  page: Page,
  company: string,
  email: string,
  password = "Password123!"
) {
  await page.goto("/login");
  await page.locator("#company").fill(company);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
