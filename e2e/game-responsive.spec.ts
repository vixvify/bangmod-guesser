import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 400, height: 850 },
]) {
  test(`keeps the game controls below the image at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/game", { waitUntil: "domcontentloaded" });

    const image = page.locator('img[src*="kmutt-bangmod-1.jpg"]').first();
    const submit = page.getByRole("button", { name: "ส่งคำตอบ" });
    const timer = page.getByRole("timer");
    const navigation = page.locator("header nav");

    await expect(image).toBeVisible();
    await expect(submit).toBeVisible();

    const imageBox = await image.boundingBox();
    const submitBox = await submit.boundingBox();
    const timerBox = await timer.boundingBox();
    const navigationBox = await navigation.boundingBox();

    expect(imageBox).not.toBeNull();
    expect(submitBox).not.toBeNull();
    expect(timerBox).not.toBeNull();
    expect(navigationBox).not.toBeNull();
    expect(submitBox!.y).toBeGreaterThanOrEqual(imageBox!.y + imageBox!.height);
    expect(
      timerBox!.y - (navigationBox!.y + navigationBox!.height),
    ).toBeGreaterThanOrEqual(24);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);
  });
}

for (const viewport of [
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`keeps the map controls over the image at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/game", { waitUntil: "domcontentloaded" });

    const image = page.locator('img[src*="kmutt-bangmod-1.jpg"]').first();
    const submit = page.getByRole("button", { name: "ส่งคำตอบ" });

    await expect(image).toBeVisible();
    await expect(submit).toBeVisible();

    const imageBox = await image.boundingBox();
    const submitBox = await submit.boundingBox();

    expect(imageBox).not.toBeNull();
    expect(submitBox).not.toBeNull();
    expect(submitBox!.y).toBeLessThan(imageBox!.y + imageBox!.height);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);
  });
}

test("shows the image in a proportional popup on portrait screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 400, height: 850 });
  await page.goto("/game", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.getByRole("button", { name: "เต็มจอ" }).click();

  const fullscreenImage = page.getByRole("dialog").locator("img").first();
  await expect(fullscreenImage).toBeVisible();
  await expect(fullscreenImage).toHaveCSS("object-fit", "cover");

  const imageBox = await fullscreenImage.boundingBox();
  const dialogBox = await page.getByRole("dialog").boundingBox();
  expect(imageBox).not.toBeNull();
  expect(dialogBox).not.toBeNull();
  expect(imageBox!.width).toBeGreaterThan(imageBox!.height);
  expect(dialogBox!.height).toBeLessThan(850 / 2);
  expect(dialogBox!.width / dialogBox!.height).toBeCloseTo(4 / 3, 1);
});

test("keeps the displayed image ratio when opening the popup on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/game", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".leaflet-container")).toBeVisible();

  const imageFrame = page.getByRole("button", { name: "เต็มจอ" }).locator("xpath=../..");
  const frameBox = await imageFrame.boundingBox();
  expect(frameBox).not.toBeNull();

  await page.getByRole("button", { name: "เต็มจอ" }).click();
  const popupBox = await page.getByRole("dialog").boundingBox();
  expect(popupBox).not.toBeNull();
  await expect(page.locator('img[src*="kmutt-bangmod-1.jpg"]')).toHaveCount(2);
  expect(popupBox!.width / popupBox!.height).toBeCloseTo(
    frameBox!.width / frameBox!.height,
    1,
  );

  await page.getByRole("button", { name: "ออกจากเต็มจอ" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator('img[src*="kmutt-bangmod-1.jpg"]')).toHaveCount(1);
});
