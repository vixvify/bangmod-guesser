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

test("shows the complete landscape image in portrait fullscreen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 400, height: 850 });
  await page.goto("/game", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "เต็มจอ" }).click();

  const fullscreenImage = page.getByRole("dialog").locator("img").first();
  await expect(fullscreenImage).toBeVisible();
  await expect(fullscreenImage).toHaveCSS("object-fit", "contain");

  const imageBox = await fullscreenImage.boundingBox();
  expect(imageBox).not.toBeNull();
  expect(imageBox!.width).toBeGreaterThan(imageBox!.height);
});
