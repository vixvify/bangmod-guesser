import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/prisma", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const { E2E_DATABASE_URL } = await import("../../../e2e/config");
  return { prisma: new PrismaClient({ datasourceUrl: E2E_DATABASE_URL }) };
});
import { prisma } from "@/shared/lib/prisma";
import { GameRepositoryImpl } from "@/features/game/server/game.repository";

const repository = new GameRepositoryImpl();
const now = new Date("2026-10-27T12:00:00Z");

describe.skipIf(process.env.RUN_GAME_DATABASE_TESTS !== "1")("GameRepositoryImpl with real PostgreSQL", () => {
  let userId: string;
  let gameId: string;
  let locationId: string;

  beforeEach(async () => {
    const suffix = randomUUID();
    userId = `exit-test-user-${suffix}`;
    gameId = `exit-test-game-${suffix}`;
    locationId = `exit-test-location-${suffix}`;
    await prisma.user.create({ data: { id: userId, name: "Exit test", email: `${suffix}@example.test` } });
    await prisma.location.create({ data: { id: locationId, name: "Exit test location", latitude: 13.65, longitude: 100.49 } });
    await prisma.game.create({ data: {
      id: gameId, userId, totalScore: 900,
      rounds: { create: { questionNumber: 1, locationId, status: "COMPLETED", score: 900, playTimeSeconds: 20 } },
    } });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.location.deleteMany({ where: { id: locationId } });
  });
  afterAll(async () => { await prisma.$disconnect(); });

  it("changes status and finish time while preserving score and round records", async () => {
    const before = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { rounds: true } });
    expect(await repository.exitPlayingGame(gameId, userId, now)).toMatchObject({ status: "INCOMPLETE", finishedAt: now });
    const after = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { rounds: true } });
    expect(after).toEqual({ ...before, status: "INCOMPLETE", finishedAt: now });
  });

  it("makes concurrent exits return the same stored finish time", async () => {
    const later = new Date("2026-10-27T13:00:00Z");
    const results = await Promise.all([
      repository.exitPlayingGame(gameId, userId, now),
      repository.exitPlayingGame(gameId, userId, later),
    ]);
    expect(results[0]?.status).toBe("INCOMPLETE");
    expect(results[0]).toEqual(results[1]);
    expect([now.getTime(), later.getTime()]).toContain(results[0]?.finishedAt?.getTime());
  });

  it.each(["COMPLETED", "INCOMPLETE"] as const)("does not overwrite %s even after a stale PLAYING read", async (status) => {
    expect((await repository.findById(gameId))?.status).toBe("PLAYING");
    const finishedAt = new Date("2026-10-27T11:00:00Z");
    await prisma.game.update({ where: { id: gameId }, data: { status, finishedAt } });
    expect(await repository.exitPlayingGame(gameId, userId, now)).toMatchObject({ status, finishedAt });
    expect(await prisma.game.findUniqueOrThrow({ where: { id: gameId } })).toMatchObject({ status, finishedAt, totalScore: 900 });
  });

  it("cannot update or return another user's game", async () => {
    expect(await repository.exitPlayingGame(gameId, "other-player", now)).toBeNull();
    expect(await prisma.game.findUniqueOrThrow({ where: { id: gameId } })).toMatchObject({ status: "PLAYING", finishedAt: null });
  });

  it("returns null for a missing game", async () => {
    expect(await repository.exitPlayingGame("missing", userId, now)).toBeNull();
  });

  it("expires a game with no opened round and preserves its score and rounds", async () => {
    await prisma.game.update({ where: { id: gameId }, data: { startedAt: new Date("2026-10-27T07:59:59Z") } });
    const before = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { rounds: true } });
    expect(await repository.expireInactiveGames(new Date("2026-10-27T08:00:00Z"), now)).toBe(1);
    const after = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { rounds: true } });
    expect(after).toEqual({ ...before, status: "INCOMPLETE", finishedAt: now });
    expect(await repository.expireInactiveGames(new Date("2026-10-27T08:00:00Z"), now)).toBe(0);
  });

  it("uses the latest opened round instead of the game's start time", async () => {
    await prisma.game.update({ where: { id: gameId }, data: { startedAt: new Date("2026-10-26T00:00:00Z") } });
    await prisma.gameRound.update({ where: { gameId_questionNumber: { gameId, questionNumber: 1 } }, data: { startedAt: new Date("2026-10-27T08:00:00Z") } });
    expect(await repository.expireInactiveGames(new Date("2026-10-27T08:00:00Z"), now)).toBe(0);
    expect((await prisma.game.findUniqueOrThrow({ where: { id: gameId } })).status).toBe("PLAYING");
    expect(await repository.expireInactiveGames(new Date("2026-10-27T08:00:01Z"), now)).toBe(1);
  });

  it.each(["COMPLETED", "INCOMPLETE"] as const)("does not overwrite an old %s game", async (status) => {
    const finishedAt = new Date("2026-10-27T07:00:00Z");
    await prisma.game.update({ where: { id: gameId }, data: { status, startedAt: new Date("2026-10-26T00:00:00Z"), finishedAt } });
    expect(await repository.expireInactiveGames(new Date("2026-10-27T08:00:00Z"), now)).toBe(0);
    expect(await prisma.game.findUniqueOrThrow({ where: { id: gameId } })).toMatchObject({ status, finishedAt, totalScore: 900 });
  });

  it("does not close a game while another transaction opens a new round", async () => {
    await prisma.game.update({ where: { id: gameId }, data: { startedAt: new Date("2026-10-26T00:00:00Z") } });
    let release!: () => void;
    let locked!: () => void;
    const lockAcquired = new Promise<void>((resolve) => { locked = resolve; });
    const continueTransaction = new Promise<void>((resolve) => { release = resolve; });
    const openingRound = prisma.$transaction(async (transaction) => {
      await transaction.game.update({ where: { id: gameId }, data: { status: "PLAYING" } });
      await transaction.gameRound.update({ where: { gameId_questionNumber: { gameId, questionNumber: 1 } }, data: { startedAt: now } });
      locked();
      await continueTransaction;
    });
    try {
      await lockAcquired;
      expect(await repository.expireInactiveGames(new Date("2026-10-27T08:00:00Z"), now)).toBe(0);
    } finally {
      release();
      await openingRound;
    }
    expect(await repository.expireInactiveGames(new Date("2026-10-27T08:00:00Z"), now)).toBe(0);
    expect((await prisma.game.findUniqueOrThrow({ where: { id: gameId } })).status).toBe("PLAYING");
  });
});

