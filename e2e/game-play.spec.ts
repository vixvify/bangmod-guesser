import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { E2E_DATABASE_URL } from "./config";
import { signInGamePlayer } from "../tests/helpers/sign-in-game-player";

const prisma = new PrismaClient({ datasourceUrl: E2E_DATABASE_URL });
test.afterAll(async () => { await prisma.$disconnect(); });

test("plays five rounds through the UI and displays the saved summary", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await signInGamePlayer(page, testInfo);
  const ids = Array.from({ length: 5 }, (_, index) => `ui-game-${randomUUID()}-${index}`);
  let gameId: string | undefined;
  try {
    for (const id of ids) {
      await prisma.location.create({ data: {
        id, name: "สถานที่ทดสอบเกม", latitude: 13.6513, longitude: 100.4943,
        images: { create: { imageNumber: 1, imageUrl: "/images/kmutt-bangmod-1.jpg" } },
      } });
    }
    await page.goto("/");
    await page.getByRole("button", { name: "Play Bangmod Guesser" }).click();
    await expect(page).toHaveURL(/\/game\/[a-zA-Z0-9-]+$/, { timeout: 20000 });
    gameId = new URL(page.url()).pathname.split("/").at(-1);
    for (let round = 1; round <= 5; round++) {
      await expect(page.getByRole("timer")).toBeVisible();
      await expect(page.getByText("ข้อที่")).toBeVisible();
      await page.getByRole("button", { name: "ปักหมุดกลางแผนที่" }).first().click();
      await page.getByRole("button", { name: "ส่งคำตอบ" }).click();
      await expect(page).toHaveURL(new RegExp(`/round-score\\?round=${round}$`));
      await expect(page.getByRole("heading", { name: "สถานที่ทดสอบเกม" })).toBeVisible();
      await page.getByRole("link", { name: round === 5 ? "สรุปผลเกม" : "รอบถัดไป" }).click();
    }
    await expect(page).toHaveURL(/\/summary$/);
    await expect(page.getByRole("meter", { name: "คะแนนรวมโบนัส" })).toBeVisible();
    const game = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { rounds: true } });
    expect(game.status).toBe("COMPLETED");
    expect(game.rounds.every((round) => round.status === "COMPLETED")).toBe(true);
  } finally {
    if (gameId) await prisma.game.deleteMany({ where: { id: gameId } });
    await prisma.location.deleteMany({ where: { id: { in: ids } } });
  }
});
