import { test, expect } from "@playwright/test";

test("login page links to the forgot-password flow", async ({ page }) => {
  await page.goto("/login");
  const link = page.getByRole("link", { name: /forgot password/i });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/forgot/);
  await expect(
    page.getByRole("heading", { name: /reset your password/i })
  ).toBeVisible();
});

test("forgot-password returns a generic confirmation (no user enumeration)", async ({
  page,
}) => {
  await page.goto("/forgot");
  await page.locator("#company").fill("alarrab");
  // An address that does not exist must produce the SAME response as one that
  // does, so the form cannot be used to probe which emails are registered.
  await page.locator("#email").fill("definitely-not-a-user@example.com");
  await page.getByRole("button", { name: /send reset link/i }).click();
  await expect(page.getByText(/if an account matches/i)).toBeVisible();
});

test("an invalid reset link shows the unavailable state", async ({ page }) => {
  await page.goto("/reset/alarrab/this-token-is-not-valid");
  await expect(
    page.getByRole("heading", { name: /link unavailable/i })
  ).toBeVisible();
  // Offers a way to request a fresh link.
  await expect(page.getByRole("link", { name: /request a new link/i })).toBeVisible();
});
