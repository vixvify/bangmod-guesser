import { expect, test, type Page } from "@playwright/test";
import { AUTH_MESSAGES } from "../src/core/constants/auth";

const player = {
  name: "New Player",
  email: "player@example.com",
  password: "Password1",
};
const realPlayer = { ...player, email: "real-player@example.test" };

async function fillRegistration(page: Page, account = player) {
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้" }).fill(`  ${account.name}  `);
  await page.getByRole("textbox", { name: "อีเมล" }).fill(`  ${account.email.toUpperCase()}  `);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(account.password);
  await page.getByLabel("ยืนยันรหัสผ่าน").fill(account.password);
}

test("registers in the test database, signs in, and keeps access to the protected profile", async ({ page }) => {
  await page.goto("/profile", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprofile$/);

  await page.goto("/register?callbackUrl=%2Fprofile", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/register\?callbackUrl=%2Fprofile$/);
  await fillRegistration(page, realPlayer);

  const signupResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/session/register"),
  );
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
  const signupResponse = await signupResponsePromise;
  expect(signupResponse.ok()).toBe(true);

  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprofile$/, { timeout: 15_000 });
  await page.goto("/login?callbackUrl=%2Fprofile", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "อีเมล" }).fill(realPlayer.email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(realPlayer.password);

  const loginResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/session/login"),
  );
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.ok()).toBe(true);

  await expect(page).toHaveURL(/\/profile$/, { timeout: 15_000 });
  const profile = page.getByRole("region", { name: "ข้อมูลโปรไฟล์" });
  await expect(profile.getByRole("heading", { name: realPlayer.name })).toBeVisible();
  await expect(profile).toContainText(realPlayer.email);

  await page.reload();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("region", { name: "ข้อมูลโปรไฟล์" })).toContainText(realPlayer.email);

  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  const logoutResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/session/logout"),
  );
  await page.getByRole("dialog").getByRole("button", { name: AUTH_MESSAGES.logout.confirm }).click();
  const logoutResponse = await logoutResponsePromise;
  expect(logoutResponse.ok()).toBe(true);
  await expect(page.getByText(AUTH_MESSAGES.logout.success)).toBeVisible();
  await page.goto("/profile", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprofile$/);
});

test("signs up, then signs in and returns to the requested page", async ({ page }) => {
  let registrationBody: unknown;
  let loginBody: unknown;

  await page.route("**/api/session/register", async (route) => {
    registrationBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: null, status: 201, statusCode: "CREATED" }),
    });
  });
  await page.route("**/api/session/login", async (route) => {
    loginBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: null, status: 200, statusCode: "SUCCESS" }),
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
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

  await expect(page).toHaveURL(/\/game$/);
  expect(loginBody).toEqual({ email: player.email, password: player.password });
});

test("does not submit registration when passwords differ", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/session/register", async (route) => {
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
  await page.route("**/api/session/register", (route) =>
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
  await page.route("**/api/session/login", (route) =>
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
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

  await expect(page.getByText(AUTH_MESSAGES.submit.loginFailed)).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("starts Google sign-in from login and keeps the requested destination", async ({ page }) => {
  let socialBody: unknown;

  await page.route("**/api/session/google", async (route) => {
    socialBody = route.request().postDataJSON();
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ code: "OAUTH_PROVIDER_NOT_FOUND", message: "Unavailable" }),
    });
  });

  await page.goto("/login?callbackUrl=%2Fgame", { waitUntil: "networkidle" });
  const googleButton = page.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" });
  const googleLogo = googleButton.locator("img");
  const divider = page.getByText("หรือ", { exact: true });
  const googleLabel = googleButton.getByText("เข้าสู่ระบบด้วย Google");
  const [dividerBox, buttonBox, logoBox, labelBox] = await Promise.all([
    divider.boundingBox(),
    googleButton.boundingBox(),
    googleLogo.boundingBox(),
    googleLabel.boundingBox(),
  ]);
  expect(dividerBox && buttonBox && buttonBox.y - (dividerBox.y + dividerBox.height))
    .toBeGreaterThanOrEqual(20);
  expect(dividerBox && buttonBox && buttonBox.y - (dividerBox.y + dividerBox.height))
    .toBeLessThanOrEqual(32);
  expect(logoBox && labelBox && labelBox.x - (logoBox.x + logoBox.width))
    .toBeGreaterThanOrEqual(16);
  await expect(googleLogo).toHaveAttribute("src", /google\.webp/);
  await expect.poll(() => googleLogo.evaluate((image) => (image as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await googleButton.click();

  await expect(page.getByText(AUTH_MESSAGES.submit.googleLoginFailed)).toBeVisible();
  expect(socialBody).toMatchObject({
    callbackURL: "/game",
    errorCallbackURL: "/login?callbackUrl=%2Fgame",
  });
});
