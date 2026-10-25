import { test, expect } from "@playwright/test";

test("terms and privacy pages are public and cross-link", async ({ page }) => {
  await page.goto("/legal/terms");
  await expect(
    page.getByRole("heading", { name: /terms of service/i, level: 1 })
  ).toBeVisible();
  // Every policy page carries the template/legal-review notice.
  await expect(page.getByText(/template notice/i)).toBeVisible();

  await page.getByRole("link", { name: /privacy policy/i }).click();
  await expect(page).toHaveURL(/\/legal\/privacy/);
  await expect(
    page.getByRole("heading", { name: /privacy policy/i, level: 1 })
  ).toBeVisible();
  // PDPL alignment is stated in the privacy policy.
  await expect(page.getByText(/personal data protection law/i)).toBeVisible();
});

test("the landing footer links to the policy pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /privacy policy/i }).click();
  await expect(page).toHaveURL(/\/legal\/privacy/);
});
