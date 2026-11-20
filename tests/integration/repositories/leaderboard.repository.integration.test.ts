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

  it("excludes permanent bans before ranking but keeps active and temporarily banned users", async () => {
    const prefix = `leaderboard-ban-${randomUUID()}`;
    const players = [
      { id: `${prefix}-permanent`, banned: true, banExpires: null, score: 5000 },
      { id: `${prefix}-temporary`, banned: true, banExpires: new Date(Date.now() + 86_400_000), score: 4000 },
      { id: `${prefix}-active`, banned: false, banExpires: null, score: 3000 },
    ];
    const ids = players.map(({ id }) => id);
    const repository = new LeaderboardRepositoryImpl();
    try {
      await prisma.user.createMany({
        data: players.map(({ id, banned, banExpires }) => ({ id, name: id, email: `${id}@example.test`, banned, banExpires })),
      });
      await prisma.game.createMany({
        data: players.map(({ id, score }) => ({ userId: id, status: "COMPLETED", totalScore: score })),
      });
      const [permanent, temporary, active] = await Promise.all(ids.map((id) => repository.findLeaderboard(id)));
      expect(permanent.myRank).toBeNull();
      expect(permanent.entries).not.toContainEqual(expect.objectContaining({ userId: ids[0] }));
      expect(temporary.myRank).toMatchObject({ userId: ids[1], totalScore: 4000 });
      expect(active.myRank).toMatchObject({ userId: ids[2], totalScore: 3000 });

      await prisma.user.update({ where: { id: ids[0] }, data: { banned: false } });
      const afterUnban = await repository.findLeaderboard(ids[1]);
      expect(afterUnban.myRank?.rank).toBe(temporary.myRank!.rank + 1);
    } finally {
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
  });

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
