import { expect, test } from "@playwright/test";
import { SETTINGS_MESSAGES } from "@/features/settings/settings.constants";

test("keeps confirmed settings after a page reload", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const settings = page.getByRole("dialog", { name: SETTINGS_MESSAGES.title });
  const openSettings = async () => {
    await expect(async () => {
      if (!(await settings.isVisible())) {
        await page.getByRole("button", { name: SETTINGS_MESSAGES.title }).click();
      }
      await expect(settings).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
  };
  await openSettings();
  const systemSound = settings.getByRole("slider", { name: SETTINGS_MESSAGES.sfxVolume });
  await systemSound.focus();
  await page.keyboard.press("ArrowRight");
  await expect(settings.getByText("81%")).toBeVisible();

  await settings.getByRole("button", { name: SETTINGS_MESSAGES.confirm }).click();
  await expect(settings).toBeHidden();
  await expect.poll(async () => page.evaluate(() => {
    const value = localStorage.getItem("bangmod-guesser:settings");
    return value ? JSON.parse(value).state.systemSound : null;
  })).toBe(81);

  await page.reload({ waitUntil: "domcontentloaded" });
  await openSettings();

  await expect(settings.getByText("81%")).toBeVisible();
  await expect(settings.getByRole("combobox")).toHaveCount(0);
});
