import { expect, test } from "@playwright/test";
import { E2E_BASE_URL } from "./config";

test("guests are sent to login and return to their game after signing in", async ({ page }) => {
  for (const destination of [
    "/game/demo?mode=practice",
    "/game/demo/round-score",
    "/game/demo/summary",
  ]) {
    await page.goto(destination, { waitUntil: "domcontentloaded" });
    const loginUrl = new URL(page.url());
    expect(loginUrl.pathname).toBe("/login");
    expect(loginUrl.searchParams.get("callbackUrl")).toBe(destination);
  }

  const account = {
    name: "Authenticated Game Player",
    email: "game-auth-player@example.test",
    password: "TestPassword1!",
  };
  const registration = await page.request.post("/api/auth/sign-up/email", {
    data: account,
    headers: { Origin: E2E_BASE_URL },
  });
  expect(registration.ok()).toBe(true);

  await page.goto("/game/demo?mode=practice", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "อีเมล" }).fill(account.email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page).toHaveURL(/\/game\/demo\?mode=practice$/);
  await expect(page.getByRole("heading", { name: "ทายสถานที่" })).toBeVisible();

  await page.goto("/game/demo/round-score", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/game/demo/summary", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
