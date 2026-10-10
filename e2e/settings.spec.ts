import { expect, test } from "@playwright/test";
import { SETTINGS_MESSAGES } from "@/core/constants/settings";

test("keeps confirmed settings after a page reload", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: SETTINGS_MESSAGES.title }).click();

  const settings = page.getByRole("dialog", { name: SETTINGS_MESSAGES.title });
  const systemSound = settings.getByRole("slider", { name: SETTINGS_MESSAGES.sfxVolume });
  await systemSound.focus();
  await page.keyboard.press("ArrowRight");
  await expect(settings.getByText("81%")).toBeVisible();

  await settings.getByRole("combobox", { name: SETTINGS_MESSAGES.imageQuality }).click();
  await page.getByRole("option", { name: SETTINGS_MESSAGES.qualities.medium }).click();
  await settings.getByRole("button", { name: SETTINGS_MESSAGES.confirm }).click();

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: SETTINGS_MESSAGES.title }).click();

  await expect(settings.getByText("81%")).toBeVisible();
  await expect(settings.getByRole("combobox", { name: SETTINGS_MESSAGES.imageQuality }))
    .toContainText(SETTINGS_MESSAGES.qualities.medium);
});
