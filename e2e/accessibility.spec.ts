import axe from "axe-core";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";
import { E2E_BASE_URL, E2E_DATABASE_URL } from "./config";
import { signInGamePlayer } from "../tests/helpers/sign-in-game-player";

async function expectAccessible(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const axeRunner = (window as Window & { axe?: typeof axe }).axe;
    if (!axeRunner) throw new Error("axe-core did not load");
    const { violations } = await axeRunner.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
      },
    });
    return violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
    }));
  });
  expect(violations, `Accessibility issues at ${page.url()}`).toEqual([]);
}

for (const path of ["/", "/login", "/register", "/forgot-password", "/reset-password"]) {
  test(`guest page ${path} passes automated accessibility checks`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expectAccessible(page);
  });
}

for (const path of [
  "/profile",
  "/leaderboard",
  "/game/demo/round-score",
  "/game/demo/summary",
  "/game/demo",
]) {
  test(`authenticated page ${path} passes automated accessibility checks`, async ({ page }, testInfo) => {
    await signInGamePlayer(page, testInfo);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expectAccessible(page);
  });
}

test("skip link, settings modal, and keyboard focus work on the home page", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "ข้ามไปเนื้อหาหลัก" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const settings = page.getByRole("button", { name: "ตั้งค่าเกม" });
  await settings.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectAccessible(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(settings).toBeFocused();
});

test("admin pages and user editor pass automated accessibility checks", async ({ page }) => {
  test.setTimeout(120_000);
  const prisma = new PrismaClient({ datasources: { db: { url: E2E_DATABASE_URL } } });
  const admin = {
    name: "Accessibility Admin",
    email: "a11y-admin@example.test",
    password: "TestPassword1!",
  };
  try {
    const registration = await page.request.post("/api/auth/sign-up/email", {
      data: admin,
      headers: { Origin: E2E_BASE_URL },
    });
    expect(registration.ok()).toBe(true);
    await prisma.user.update({ where: { email: admin.email }, data: { role: "ADMIN" } });
    const login = await page.request.post("/api/auth/sign-in/email", {
      data: { email: admin.email, password: admin.password },
      headers: { Origin: E2E_BASE_URL },
    });
    expect(login.ok()).toBe(true);

    for (const [path, heading] of [
      ["/admin", "ภาพรวมระบบ"],
      ["/admin/users", "จัดการผู้ใช้"],
      ["/admin/locations", "จัดการสถานที่"],
      ["/admin/locations/create", "สร้างสถานที่"],
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expectAccessible(page);
    }

    await page.goto("/admin/users", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: `แก้ไข ${admin.name}` }).click();
    await expect(page.getByRole("dialog", { name: "แก้ไขผู้ใช้" })).toBeVisible();
    await expect(page.locator(".MuiBackdrop-root")).toHaveCSS("opacity", "1");
    await expectAccessible(page);
  } finally {
    await prisma.$disconnect();
  }
});
