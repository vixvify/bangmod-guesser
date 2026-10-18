import { expect, test } from "@playwright/test";
import { signInGamePlayer } from "../tests/helpers/sign-in-game-player";

test.beforeEach(async ({ page }, testInfo) => {
  await signInGamePlayer(page, testInfo);
});

for (const viewport of [
  { width: 375, height: 667 },
  { width: 1440, height: 900 },
]) {
  test(`round score remains readable at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/game/demo/round-score", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "แผนที่ผลการทายสถานที่" })).toBeVisible();
    await expect(page.getByRole("link", { name: "รอบถัดไป" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: testInfo.outputPath(`round-score-${viewport.width}.png`), fullPage: true });
  });
}
