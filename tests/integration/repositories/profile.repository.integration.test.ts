import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/prisma", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const { E2E_DATABASE_URL } = await import("../../../e2e/config");
  return { prisma: new PrismaClient({ datasourceUrl: E2E_DATABASE_URL }) };
});
import { prisma } from "@/shared/lib/prisma";
import { ProfileRepositoryImpl } from "@/features/profile/server/profile.repository";

describe.skipIf(process.env.RUN_GAME_DATABASE_TESTS !== "1")("profile history with PostgreSQL", () => {
  let userId: string;
  beforeEach(async () => {
    userId = `profile-${randomUUID()}`;
    await prisma.user.create({ data: { id: userId, name: "Player", email: `${userId}@example.test` } });
    await prisma.game.createMany({ data: [
      { id: `${userId}-completed`, userId, status: "COMPLETED", totalScore: 1234, startedAt: new Date("2026-10-10T00:00:00Z") },
      { id: `${userId}-incomplete`, userId, status: "INCOMPLETE", startedAt: new Date("2026-10-11T00:00:00Z") },
      { id: `${userId}-playing`, userId, status: "PLAYING", startedAt: new Date("2026-10-12T00:00:00Z") },
    ] });
  });
  afterEach(async () => { await prisma.user.deleteMany({ where: { id: userId } }); });
  afterAll(async () => { await prisma.$disconnect(); });

  it("includes completed and abandoned games in pagination but excludes active games", async () => {
    const repository = new ProfileRepositoryImpl();
    const first = await repository.findProfile(userId, { page: 1, pageSize: 1 });
    expect(first.totalGames).toBe(2);
    expect(first.user?.games.map((game) => game.status)).toEqual(["INCOMPLETE"]);
    const second = await repository.findProfile(userId, { page: 2, pageSize: 1 });
    expect(second.user?.games.map((game) => game.status)).toEqual(["COMPLETED"]);
    const filtered = await repository.findProfile(userId, { from: new Date("2026-10-11T00:00:00Z"), page: 1, pageSize: 4 });
    expect(filtered.totalGames).toBe(1);
    expect(filtered.user?.games[0].totalScore).toBeNull();
  });
});
