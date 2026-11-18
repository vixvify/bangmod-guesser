import { expect, test } from "@playwright/test";
import { E2E_BASE_URL } from "./config";
import { mockGameApi } from "./helpers/mock-game";
import { emailVerificationUrl } from "./helpers/email-verification";

test("guests are sent to login and return to their game after signing in", async ({ page }) => {
  for (const destination of [
    "/game/demo?mode=practice",
    "/game/demo/round-score?round=2",
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
  const verification = await page.request.get(await emailVerificationUrl(account.email), { maxRedirects: 0 });
  expect(verification.headers().location).toBe("/login?verification=email");

  await page.goto("/game/demo?mode=practice", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "อีเมล" }).fill(account.email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
  const loginButton = page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true });
  await expect(loginButton).toBeEnabled();
  await mockGameApi(page);
  const loginResponse = page.waitForResponse((response) => response.url().endsWith("/api/session/login"));
  await loginButton.click();
  expect((await loginResponse).ok()).toBe(true);
  await expect(page).toHaveURL(/\/game\/demo\?mode=practice$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "ทายสถานที่" })).toBeVisible();

  await page.goto("/game/demo/round-score?round=2", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/game/demo/summary", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
