import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/prisma", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const { E2E_DATABASE_URL } = await import("../../../e2e/config");
  return { prisma: new PrismaClient({ datasourceUrl: E2E_DATABASE_URL }) };
});

import { prisma } from "@/shared/lib/prisma";
import { LeaderboardRepositoryImpl } from "@/features/leaderboard/server/leaderboard.repository";

describe.skipIf(process.env.RUN_GAME_DATABASE_TESTS !== "1")("leaderboard with PostgreSQL", () => {
  afterAll(async () => { await prisma.$disconnect(); });

  it("returns the profile image with the ranked player", async () => {
    const id = `leaderboard-image-${randomUUID()}`;
    const image = "https://example.com/avatar.jpg";
    try {
      await prisma.user.create({ data: { id, name: "Avatar player", email: `${id}@example.test`, image } });
      await prisma.game.create({ data: { userId: id, status: "COMPLETED", totalScore: 4000 } });
      const result = await new LeaderboardRepositoryImpl().findLeaderboard(id);
      expect(result.myRank).toMatchObject({ name: "Avatar player", image });
    } finally {
      await prisma.user.deleteMany({ where: { id } });
    }
  });
});
