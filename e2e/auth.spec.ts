import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /grow your people/i })
  ).toBeVisible();
});

test("tenant admin can sign in and reach the dashboard", async ({ page }) => {
  await login(page, "alarrab", "admin@alarrab.bcap");
  await expect(page.getByText(/welcome back/i)).toBeVisible();
  // Admin sees the full navigation, including People.
  await expect(page.getByRole("link", { name: /people/i })).toBeVisible();
});

test("invalid credentials are rejected", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#company").fill("alarrab");
  await page.locator("#email").fill("admin@alarrab.bcap");
  await page.locator("#password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/invalid company, email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("unauthenticated access to a protected page redirects to login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
