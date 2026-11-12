import { expect, test } from "@playwright/test";

test("shows the rate limit retry delay when requesting a password reset", async ({ page }) => {
  await page.route("**/api/session/forgot-password", (route) => route.fulfill({
    status: 429,
    headers: { "retry-after": "15" },
    json: { error: "Too many requests", status: 429, statusCode: "ERROR" },
  }));
  await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "อีเมล" }).fill("player@example.test");
  await page.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" }).click();
  await expect(page.getByText("ส่งคำขอบ่อยเกินไป กรุณารอ 15 วินาทีแล้วลองอีกครั้ง")).toBeVisible();
});

test("blocks password-reset requests from an untrusted origin", async ({ request }) => {
  for (const [path, data] of [
    ["/api/session/forgot-password", { email: "player@example.test" }],
    ["/api/session/reset-password", { token: "test-token", password: "Password1", confirmPassword: "Password1" }],
  ] as const) {
    const response = await request.post(path, {
      headers: { origin: "https://untrusted.example" },
      data,
    });
    expect(response.status()).toBe(403);
  }
});
