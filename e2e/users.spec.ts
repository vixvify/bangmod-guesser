import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { USER_MESSAGES } from "../src/core/constants/user";
import { E2E_BASE_URL, E2E_DATABASE_URL } from "./config";

const prisma = new PrismaClient({ datasources: { db: { url: E2E_DATABASE_URL } } });
const admin = {
  name: "User Management Admin",
  email: "users-admin@example.test",
  password: "TestPassword1!",
};
const player = {
  name: "Managed E2E Player",
  email: "managed-player@example.test",
  password: "TestPassword1!",
};

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("admin lists, edits, and deletes a user through the management page", async ({ page }) => {
  for (const account of [admin, player]) {
    if (await prisma.user.findUnique({ where: { email: account.email } })) continue;
    const registration = await page.request.post("/api/auth/sign-up/email", {
      data: account,
      headers: { Origin: E2E_BASE_URL },
    });
    expect(registration.ok()).toBe(true);
  }
  await prisma.user.update({ where: { email: admin.email }, data: { role: "ADMIN" } });
  await prisma.user.update({
    where: { email: player.email },
    data: { name: player.name, role: "USER", status: "ACTIVE", banned: false },
  });

  const login = await page.request.post("/api/auth/sign-in/email", {
    data: { email: admin.email, password: admin.password },
    headers: { Origin: E2E_BASE_URL },
  });
  expect(login.ok()).toBe(true);

  await page.goto("/admin/users", { waitUntil: "networkidle" });
  await expect(page.getByRole("table", { name: "รายชื่อผู้ใช้" })).toContainText(player.name);

  await page.getByRole("button", { name: `แก้ไข ${player.name}` }).click();
  const modal = page.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
  await modal.getByRole("textbox", { name: "ชื่อผู้ใช้" }).fill("Updated E2E Player");
  await modal.getByRole("button", { name: "ยกเลิก" }).click();
  const discard = page.getByRole("dialog", { name: USER_MESSAGES.discardConfirm.title });
  await discard.getByRole("button", { name: USER_MESSAGES.discardConfirm.cancel }).click();
  await expect(modal.getByRole("textbox", { name: "ชื่อผู้ใช้" })).toHaveValue("Updated E2E Player");

  await modal.getByRole("button", { name: "บันทึก" }).click();
  const confirmation = page.getByRole("dialog", { name: USER_MESSAGES.updateConfirm.title });
  const updateResponse = page.waitForResponse((response) =>
    response.url().includes("/api/users/") && response.request().method() === "PATCH",
  );
  await confirmation.getByRole("button", { name: USER_MESSAGES.updateConfirm.confirm }).click();
  expect((await updateResponse).ok()).toBe(true);
  await expect(confirmation).toBeHidden();
  await expect(page.getByRole("table", { name: "รายชื่อผู้ใช้" })).toContainText("Updated E2E Player");
  await expect.poll(async () => (await prisma.user.findUnique({ where: { email: player.email } }))?.name).toBe("Updated E2E Player");

  await page.getByRole("button", { name: "แก้ไข Updated E2E Player" }).click();
  const statusModal = page.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
  await statusModal.getByRole("radio", { name: /ระงับการใช้งาน/ }).click();
  await statusModal.getByRole("button", { name: "บันทึก" }).click();
  const statusResponse = page.waitForResponse((response) =>
    response.url().includes("/api/users/") && response.request().method() === "PATCH",
  );
  await page.getByRole("dialog", { name: USER_MESSAGES.updateConfirm.title })
    .getByRole("button", { name: USER_MESSAGES.updateConfirm.confirm }).click();
  expect((await statusResponse).ok()).toBe(true);
  await expect.poll(async () => {
    const user = await prisma.user.findUnique({ where: { email: player.email } });
    return { status: user?.status, banned: user?.banned };
  }).toEqual({ status: "SUSPENDED", banned: true });

  await page.getByRole("button", { name: "ลบ Updated E2E Player" }).click();
  const deleteConfirmation = page.getByRole("dialog", { name: USER_MESSAGES.delete.title });
  await deleteConfirmation.getByRole("button", { name: USER_MESSAGES.delete.confirm }).click();
  await expect.poll(async () => prisma.user.findUnique({ where: { email: player.email } })).toBeNull();
});
