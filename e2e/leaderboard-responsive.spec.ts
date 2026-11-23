import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { signInGamePlayer } from "../tests/helpers/sign-in-game-player";
import { E2E_DATABASE_URL } from "./config";

const prisma = new PrismaClient({ datasourceUrl: E2E_DATABASE_URL });

test.afterAll(async () => { await prisma.$disconnect(); });

test("keeps leaderboard cards inside the viewport at mobile, tablet, and desktop widths", async ({ page }, testInfo) => {
  await signInGamePlayer(page, testInfo);
  const ids = Array.from({ length: 4 }, () => randomUUID());
  try {
    await prisma.user.createMany({
      data: ids.map((id) => ({ id, email: `${id}@example.test`, name: `LeaderboardPlayerWithALongName${id.slice(0, 6)}` })),
    });
    await prisma.game.createMany({
      data: ids.map((userId, index) => ({ userId, totalScore: 5000 - index, status: "COMPLETED" })),
    });

    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/leaderboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "อันดับผู้เล่น" })).toBeVisible();
    const cards = page.locator("[data-leaderboard-rank]");
    await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(4);

    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 720 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const podium = page.getByRole("list", { name: "สามอันดับแรก" });
      const first = await podium.getByRole("listitem").nth(0).boundingBox();
      const second = await podium.getByRole("listitem").nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (width < 640) {
        expect(first!.x).toBeCloseTo(second!.x);
        expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
      } else {
        expect(second!.x).toBeLessThan(first!.x);
      }
      for (const card of await cards.all()) {
        const bounds = await card.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
    }
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
});
