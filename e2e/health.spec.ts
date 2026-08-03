import { test, expect } from "@playwright/test";

test("health endpoint reports ok with a live database", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.db).toBe("up");
  expect(typeof body.uptimeSeconds).toBe("number");
  expect(typeof body.timestamp).toBe("string");
});
