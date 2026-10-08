import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { LOCATION_MESSAGES } from "../src/core/constants/location";
import { E2E_BASE_URL, E2E_DATABASE_URL } from "./config";

const prisma = new PrismaClient({ datasources: { db: { url: E2E_DATABASE_URL } } });
const admin = {
  name: "Location Test Admin",
  email: "location-admin@example.test",
  password: "TestPassword1!",
};
const firstLocation = {
  id: "e2e-location-cb2",
  name: "อาคารเรียนรวม E2E (CB2)",
  description: "สถานที่สำหรับทดสอบ",
  latitude: 13.6516,
  longitude: 100.4952,
};
const secondLocation = {
  id: "e2e-location-field",
  name: "สนามฟุตบอล E2E",
  description: "สถานที่อีกแห่งสำหรับทดสอบ",
  latitude: 13.652,
  longitude: 100.496,
};
const imageUrl = "/images/kmutt-bangmod-1.jpg";
const imageFile = {
  name: "campus.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZkAAAAASUVORK5CYII=",
    "base64",
  ),
};

function success(data: unknown = null, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ data, status, statusCode: status === 201 ? "CREATED" : "SUCCESS" }),
  };
}

test.describe("manage locations", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    if (!(await prisma.user.findUnique({ where: { email: admin.email } }))) {
      const registration = await page.request.post("/api/auth/sign-up/email", {
        data: admin,
        headers: { Origin: E2E_BASE_URL },
      });
      expect(registration.ok()).toBe(true);
    }
    await prisma.user.update({ where: { email: admin.email }, data: { role: "ADMIN" } });

    const login = await page.request.post("/api/auth/sign-in/email", {
      data: { email: admin.email, password: admin.password },
      headers: { Origin: E2E_BASE_URL },
    });
    expect(login.ok()).toBe(true);

    await prisma.location.deleteMany({
      where: { id: { in: [firstLocation.id, secondLocation.id, "e2e-location-created"] } },
    });
    await prisma.location.create({
      data: {
        ...firstLocation,
        images: {
          create: [
            { imageNumber: 1, imageUrl },
            { imageNumber: 2, imageUrl },
          ],
        },
      },
    });
    await prisma.location.create({
      data: {
        ...secondLocation,
        images: { create: [{ imageNumber: 1, imageUrl }] },
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("lists and searches locations without reloading the page", async ({ page }) => {
    await page.goto("/admin/locations", { waitUntil: "networkidle" });
    const table = page.getByRole("table", { name: "รายชื่อสถานที่" });
    await expect(table).toContainText(firstLocation.name);
    await expect(table).toContainText(secondLocation.name);

    await page.getByRole("textbox", { name: "ค้นหาสถานที่" }).fill("CB2");
    await expect(table).toContainText(firstLocation.name);
    await expect(table).not.toContainText(secondLocation.name);
    await expect(page).toHaveURL(/\/admin\/locations\?search=CB2$/);
    await expect(page.getByRole("heading", { name: "จัดการสถานที่" })).toBeVisible();
  });

  test("creates a location after confirmation with an image", async ({ page }) => {
    let submittedBody = "";
    await page.route("**/api/locations", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      submittedBody = route.request().postData() ?? "";
      await prisma.location.create({
        data: {
          id: "e2e-location-created",
          name: "ลานกิจกรรม E2E",
          latitude: 13.6516,
          longitude: 100.4952,
          images: { create: [{ imageNumber: 1, imageUrl }] },
        },
      });
      await route.fulfill(success(null, 201));
    });

    await page.goto("/admin/locations/create", { waitUntil: "networkidle" });
    const submit = page.getByRole("button", { name: "สร้างสถานที่" });
    await expect(submit).toBeDisabled();
    await page.getByRole("textbox", { name: "ชื่อสถานที่ *" }).fill("ลานกิจกรรม E2E");
    await page.getByRole("textbox", { name: "ละติจูด *" }).fill("13.6516");
    await page.getByRole("textbox", { name: "ลองจิจูด *" }).fill("100.4952");
    await page.getByLabel("เลือกรูปภาพสถานที่").setInputFiles(imageFile);
    await expect(submit).toBeEnabled();
    await submit.click();
    expect(submittedBody).toBe("");

    const confirmation = page.getByRole("dialog", { name: LOCATION_MESSAGES.createConfirm.title });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: LOCATION_MESSAGES.createConfirm.confirm }).click();

    await expect(page).toHaveURL(/\/admin\/locations$/);
    await expect(page.getByRole("table", { name: "รายชื่อสถานที่" })).toContainText("ลานกิจกรรม E2E");
    expect(submittedBody).toContain("ลานกิจกรรม E2E");
    expect(submittedBody).toContain("campus.png");
  });

  test("updates a location and sends the retained image number", async ({ page }) => {
    let submittedBody = "";
    await page.route(`**/api/locations/${firstLocation.id}`, async (route) => {
      if (route.request().method() !== "PUT") return route.continue();
      submittedBody = route.request().postData() ?? "";
      await prisma.location.update({
        where: { id: firstLocation.id },
        data: { name: "อาคารเรียนรวม E2E แก้ไขแล้ว" },
      });
      await route.fulfill(success());
    });

    await page.goto(`/admin/locations/${firstLocation.id}/edit`, { waitUntil: "networkidle" });
    await expect(page.getByRole("textbox", { name: "ชื่อสถานที่ *" })).toHaveValue(firstLocation.name);
    await page.getByRole("button", { name: "ลบรูปที่ 1" }).click();
    await page.getByRole("textbox", { name: "ชื่อสถานที่ *" }).fill("อาคารเรียนรวม E2E แก้ไขแล้ว");
    await page.getByLabel("เลือกรูปภาพสถานที่").setInputFiles(imageFile);
    await page.getByRole("button", { name: "แก้ไขสถานที่" }).click();

    const confirmation = page.getByRole("dialog", { name: LOCATION_MESSAGES.updateConfirm.title });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: LOCATION_MESSAGES.updateConfirm.confirm }).click();

    await expect(page).toHaveURL(/\/admin\/locations$/);
    await expect(page.getByRole("table", { name: "รายชื่อสถานที่" })).toContainText("อาคารเรียนรวม E2E แก้ไขแล้ว");
    expect(submittedBody).toContain("keepImageNumbers");
    expect(submittedBody).toContain("newImages");
    expect(submittedBody).toContain("campus.png");
  });

  test("cancels and then confirms deletion", async ({ page }) => {
    let deleteRequests = 0;
    await page.route(`**/api/locations/${firstLocation.id}`, async (route) => {
      if (route.request().method() !== "DELETE") return route.continue();
      deleteRequests += 1;
      await prisma.location.delete({ where: { id: firstLocation.id } });
      await route.fulfill(success());
    });

    await page.goto("/admin/locations", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: `ลบ ${firstLocation.name}` }).click();
    const confirmation = page.getByRole("dialog", { name: LOCATION_MESSAGES.delete.title });
    await confirmation.getByRole("button", { name: LOCATION_MESSAGES.delete.cancel }).click();
    expect(deleteRequests).toBe(0);
    await expect(page.getByRole("table")).toContainText(firstLocation.name);

    await page.getByRole("button", { name: `ลบ ${firstLocation.name}` }).click();
    await confirmation.getByRole("button", { name: LOCATION_MESSAGES.delete.confirm }).click();
    await expect(page.getByRole("table")).not.toContainText(firstLocation.name);
    expect(deleteRequests).toBe(1);
  });

  test("asks before leaving an edited location through the navbar", async ({ page }) => {
    await page.goto(`/admin/locations/${firstLocation.id}/edit`, { waitUntil: "networkidle" });
    const nameInput = page.getByRole("textbox", { name: "ชื่อสถานที่ *" });
    await expect(nameInput).toHaveValue(firstLocation.name);
    await expect(async () => {
      await nameInput.fill("ชื่อที่ยังไม่บันทึก");
      await expect(nameInput).toHaveValue("ชื่อที่ยังไม่บันทึก");
    }).toPass({ timeout: 5_000 });
    await page.getByRole("link", { name: "Bangmod Guesser" }).click();

    const confirmation = page.getByRole("dialog", { name: LOCATION_MESSAGES.discardConfirm.title });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: LOCATION_MESSAGES.discardConfirm.cancel }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/locations/${firstLocation.id}/edit$`));
    await expect(nameInput).toHaveValue("ชื่อที่ยังไม่บันทึก");

    await page.getByRole("link", { name: "Bangmod Guesser" }).click();
    await confirmation.getByRole("button", { name: LOCATION_MESSAGES.discardConfirm.confirm }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
