import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { E2E_DATABASE_URL } from "./config";
import { signInGamePlayer } from "../tests/helpers/sign-in-game-player";
const prisma = new PrismaClient({ datasourceUrl: E2E_DATABASE_URL });
test.afterAll(async () => { await prisma.$disconnect(); });
test("an authenticated player completes five persisted rounds and reads their summary", async ({ page }, testInfo) => {
  await signInGamePlayer(page, testInfo);
  const suffix = randomUUID();
  const locationIds = Array.from({ length: 5 }, (_, i) => `game-e2e-${suffix}-${i}`);
  let gameId: string | undefined;
  try {
    for (const id of locationIds)
      await prisma.location.create({ data: { id, name: "Game API E2E", latitude: 13.65, longitude: 100.49, images: { create: { imageNumber: 3, imageUrl: `https://example.test/${id}.webp` } } } });
    const created = await page.request.post("/api/games");
    expect(created.status()).toBe(201);
    gameId = (await created.json()).data.gameId;
    expect((await page.request.get(`/api/games/${gameId}/summary`)).status()).toBe(409);
    const selected = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { rounds: { include: { location: true, locationImage: true }, orderBy: { questionNumber: "asc" } } } });
    expect(new Set(selected.rounds.map((r) => r.locationId)).size).toBe(5);
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
      const guesses = await Promise.all([page.request.post(`${url}/rounds/${question}/guess`, { data }), page.request.post(`${url}/rounds/${question}/guess`, { data })]);
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
  }
  finally {
    if (gameId)
      await prisma.game.deleteMany({ where: { id: gameId } });
    await prisma.location.deleteMany({ where: { id: { in: locationIds } } });
  }
});
