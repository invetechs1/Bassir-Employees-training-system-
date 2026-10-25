import { defineConfig } from "@playwright/test";
import { existsSync } from "fs";

// Prefer a pre-installed Chromium if one is present (dev container); otherwise
// fall back to the browser Playwright installs itself (CI).
const CANDIDATE =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const CHROME = existsSync(CANDIDATE) ? CANDIDATE : undefined;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "off",
    launchOptions: { executablePath: CHROME, args: ["--no-sandbox"] },
  },
  projects: [{ name: "chromium" }],
  webServer: {
    command: "npm start",
    url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 90_000,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://bcap_app:bcap_app_password@localhost:5433/bcap?schema=public",
      AUTH_SECRET:
        process.env.AUTH_SECRET ??
        "e2e-secret-please-change-0123456789abcdefghij",
    },
  },
});
