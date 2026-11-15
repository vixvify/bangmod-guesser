import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { E2E_BASE_URL, E2E_DATABASE_URL } from "./config";
import { signInGamePlayer } from "../tests/helpers/sign-in-game-player";
const prisma = new PrismaClient({ datasourceUrl: E2E_DATABASE_URL });
test.afterAll(async () => { await prisma.$disconnect(); });
test("two sessions share one game, submit one answer per round, and read the summary", async ({ page, browser }, testInfo) => {
  await signInGamePlayer(page, testInfo);
  const secondContext = await browser.newContext({ baseURL: E2E_BASE_URL });
  const secondPage = await secondContext.newPage();
  const suffix = randomUUID();
  const locationIds = Array.from({ length: 5 }, (_, i) => `game-e2e-${suffix}-${i}`);
  let gameId: string | undefined;
  const extraGameIds: string[] = [];
  try {
    await signInGamePlayer(secondPage, testInfo);
    for (const id of locationIds)
      await prisma.location.create({ data: { id, name: "Game API E2E", latitude: 13.65, longitude: 100.49, images: { create: { imageNumber: 3, imageUrl: `https://example.test/${id}.webp` } } } });
    const creates = await Promise.all([page.request.post("/api/games"), secondPage.request.post("/api/games")]);
    expect(creates.map((response) => response.status()).sort()).toEqual([200, 201]);
    const createdGames = await Promise.all(creates.map(async (response) => (await response.json()).data));
    expect(createdGames[0].gameId).toBe(createdGames[1].gameId);
    expect(createdGames.filter((game) => game.existing)).toHaveLength(1);
    gameId = createdGames[0].gameId;
    expect((await page.request.get(`/api/games/${gameId}/summary`)).status()).toBe(409);
    const selected = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { rounds: { include: { location: true, locationImage: true }, orderBy: { questionNumber: "asc" } } } });
    expect(new Set(selected.rounds.map((r) => r.locationId)).size).toBe(5);
    await expect(prisma.game.create({ data: { userId: selected.userId, status: "PLAYING" } })).rejects.toMatchObject({ code: "P2002" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const modal = page.getByRole("dialog", { name: "มีเกมที่กำลังเล่นอยู่" });
    await expect(async () => {
      if (!(await modal.isVisible())) await page.getByRole("button", { name: "Play Bangmod Guesser" }).click();
      await expect(modal).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
    await modal.getByRole("button", { name: "ยกเลิก" }).click();
    for (let question = 1; question <= 5; question++) {
      const url = `/api/games/${gameId}`;
      const currentResponse = await page.request.get(`${url}/current-round`);
      const current = await currentResponse.json();
      expect(currentResponse.status()).toBe(200);
      expect(current.data).toEqual({ questionNumber: question, imageUrl: selected.rounds[question - 1].locationImage?.imageUrl, deadlineAt: null });
      expect(await (await page.request.get(`${url}/current-round`)).json()).toEqual(current);
      const roundBeforeStart = await prisma.gameRound.findFirstOrThrow({ where: { gameId, questionNumber: question } });
      expect(roundBeforeStart.startedAt).toBeNull();
      const startedResponse = await page.request.post(`${url}/current-round`, { data: { questionNumber: question } });
      expect(startedResponse.status()).toBe(200);
      const started = await startedResponse.json();
      expect(started.data).toEqual({ ...current.data, deadlineAt: expect.any(String) });
      expect(await (await page.request.get(`${url}/current-round`)).json()).toEqual(started);
      const location = selected.rounds[question - 1].location;
      const data = { guessedLatitude: location.latitude, guessedLongitude: location.longitude };
      const guesses = await Promise.all([page.request.post(`${url}/rounds/${question}/guess`, { data }), secondPage.request.post(`${url}/rounds/${question}/guess`, { data })]);
      expect(guesses.map((r) => r.status()).sort()).toEqual([200, 409]);
      const result = await guesses.find((r) => r.status() === 200)!.json();
      expect(await (await page.request.get(`${url}/rounds/${question}/result`)).json()).toEqual(result);
      expect(result.data).toMatchObject({ score: 1000, accumulatedScore: question * 1000, imageUrl: current.data.imageUrl, location: { name: location.name } });
    }
    const summary = await (await page.request.get(`/api/games/${gameId}/summary`)).json();
    const stored = await prisma.game.findUniqueOrThrow({ where: { id: gameId } });
    expect(stored.status).toBe("COMPLETED");
    expect(summary.data.baseScore).toBe(5000);
    expect(summary.data.totalScore).toBe(stored.totalScore);
    expect((await page.request.get(`/api/games/${gameId}/current-round`)).status()).toBe(409);
    const nextGame = await page.request.post("/api/games");
    expect(nextGame.status()).toBe(201);
    const nextGameId: string = (await nextGame.json()).data.gameId;
    extraGameIds.push(nextGameId);
    const replacement = await secondPage.request.post("/api/games", { data: { replaceGameId: nextGameId } });
    expect(replacement.status()).toBe(201);
    extraGameIds.push((await replacement.json()).data.gameId);
    expect(await prisma.game.findUniqueOrThrow({ where: { id: nextGameId } })).toMatchObject({ status: "INCOMPLETE" });
    expect(await prisma.game.count({ where: { userId: selected.userId, status: "PLAYING" } })).toBe(1);
  }
  finally {
    await secondContext.close();
    await prisma.game.deleteMany({ where: { id: { in: extraGameIds } } });
    if (gameId)
      await prisma.game.deleteMany({ where: { id: gameId } });
    await prisma.location.deleteMany({ where: { id: { in: locationIds } } });
  }
});
