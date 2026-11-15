import { expect, test } from "@playwright/test";
import { signInGamePlayer } from "../tests/helpers/sign-in-game-player";

test("starts the round only after its question image has loaded", async ({ page }, testInfo) => {
  await signInGamePlayer(page, testInfo);
  let started = 0;
  let releaseImage!: () => void;
  const imageReady = new Promise<void>((resolve) => { releaseImage = resolve; });
  await page.route("**/api/games/demo/current-round", async (route) => {
    const isStart = route.request().method() === "POST";
    if (isStart) started++;
    await route.fulfill({ json: { data: { questionNumber: 1, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: isStart ? new Date(Date.now() + 40000).toISOString() : null }, status: 200, statusCode: "SUCCESS" } });
  });
  await page.route("**/images/kmutt-bangmod-1.jpg", async (route) => {
    await imageReady;
    await route.continue();
  });
  await page.goto("/game/demo", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("กำลังโหลดรอบเกม…")).toBeVisible();
  expect(started).toBe(0);
  releaseImage();
  await expect(page.getByRole("timer")).toBeVisible();
  expect(started).toBe(1);
});
