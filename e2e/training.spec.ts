import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("employee can browse the training catalog and enroll", async ({ page }) => {
  await login(page, "alarrab", "omar@alarrab.bcap");
  await page.getByRole("link", { name: /training programs/i }).click();
  await expect(page).toHaveURL(/\/training/);

  // The catalog shows published programs.
  await expect(
    page.getByRole("heading", { name: /program catalog/i })
  ).toBeVisible();

  // Enroll in the first available program if not already enrolled.
  const enroll = page.getByRole("button", { name: /^enroll$/i }).first();
  if (await enroll.count()) {
    await enroll.click();
  }

  // Either way, "My learning" should now list at least one program.
  await expect(
    page.getByRole("heading", { name: /my learning/i })
  ).toBeVisible();
  await expect(page.getByText(/enrolled|in progress|completed/i).first()).toBeVisible();
});
