import { expect, test } from "@playwright/test";
import { GAME_MESSAGES } from "@/core/constants/game";

test("asks before leaving the game with its exit button", async ({ page }) => {
  await page.goto("/game", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: GAME_MESSAGES.exitGame.button }).click();
  const confirmation = page.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title });
  await expect(confirmation).toBeVisible();

  await confirmation.getByRole("button", { name: GAME_MESSAGES.exitGame.cancel }).click();
  await expect(page).toHaveURL(/\/game$/);

  await page.getByRole("button", { name: GAME_MESSAGES.exitGame.button }).click();
  await confirmation.getByRole("button", { name: GAME_MESSAGES.exitGame.confirm }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("asks before leaving the game with browser Back", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.goto("/game", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: GAME_MESSAGES.exitGame.button })).toBeVisible();
  await page.waitForFunction(() => window.history.state?.__unsavedChangesGuard === true);

  await page.goBack({ waitUntil: "domcontentloaded" });
  const confirmation = page.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: GAME_MESSAGES.exitGame.cancel }).click();
  await expect(page).toHaveURL(/\/game$/);

  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: GAME_MESSAGES.exitGame.confirm }).click();
  await expect(page).toHaveURL(/\/$/);
});
