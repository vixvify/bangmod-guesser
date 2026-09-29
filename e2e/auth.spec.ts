import { expect, test, type Page } from "@playwright/test";
import { AUTH_MESSAGES } from "../src/core/constants/auth";

const player = {
  name: "New Player",
  email: "player@example.com",
  password: "Password1",
};

async function fillRegistration(page: Page) {
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้" }).fill(`  ${player.name}  `);
  await page.getByRole("textbox", { name: "อีเมล" }).fill("  PLAYER@EXAMPLE.COM  ");
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(player.password);
  await page.getByLabel("ยืนยันรหัสผ่าน").fill(player.password);
}

test("signs up, then signs in and returns to the requested page", async ({ page }) => {
  let registrationBody: unknown;
  let loginBody: unknown;

  await page.route("**/api/auth/sign-up/email", async (route) => {
    registrationBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "test-player", name: player.name, email: player.email },
        token: null,
      }),
    });
  });
  await page.route("**/api/auth/sign-in/email", async (route) => {
    loginBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "test-player", name: player.name, email: player.email },
        token: "mock-token",
      }),
    });
  });

  await page.goto("/register?callbackUrl=%2Fgame", { waitUntil: "networkidle" });
  await fillRegistration(page);
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();

  await expect(page).toHaveURL(/\/login\?/);
  expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe("/game");
  expect(registrationBody).toEqual({
    name: player.name,
    email: player.email,
    password: player.password,
  });

  await page.getByRole("textbox", { name: "อีเมล" }).fill("  PLAYER@EXAMPLE.COM  ");
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(player.password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  await expect(page).toHaveURL(/\/game$/);
  expect(loginBody).toEqual({ email: player.email, password: player.password });
});

test("does not submit registration when passwords differ", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/auth/sign-up/email", async (route) => {
    requests += 1;
    await route.abort();
  });

  await page.goto("/register", { waitUntil: "networkidle" });
  await fillRegistration(page);
  await page.getByLabel("ยืนยันรหัสผ่าน").fill("Different1");
  await page.getByLabel("ยืนยันรหัสผ่าน").blur();

  await expect(page.getByRole("button", { name: "สมัครสมาชิก" })).toBeDisabled();
  await expect(page).toHaveURL(/\/register$/);
  expect(requests).toBe(0);
});

test("shows registration failure and stays on sign-up", async ({ page }) => {
  await page.route("**/api/auth/sign-up/email", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({ code: "USER_ALREADY_EXISTS", message: "Already registered" }),
    }),
  );

  await page.goto("/register", { waitUntil: "networkidle" });
  await fillRegistration(page);
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();

  await expect(page.getByText(AUTH_MESSAGES.submit.registerFailed)).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
});

test("shows invalid credentials and stays on login", async ({ page }) => {
  await page.route("**/api/auth/sign-in/email", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid credentials",
      }),
    }),
  );

  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "อีเมล" }).fill(player.email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill("WrongPassword1");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  await expect(page.getByText(AUTH_MESSAGES.submit.loginFailed)).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
