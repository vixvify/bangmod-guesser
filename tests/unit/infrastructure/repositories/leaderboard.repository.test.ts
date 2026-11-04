import { beforeEach, describe, expect, it, vi } from "vitest";
import { LeaderboardRepositoryImpl } from "@/features/leaderboard/server/leaderboard.repository";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
  },
}));

const repository = new LeaderboardRepositoryImpl();

beforeEach(() => {
  vi.resetAllMocks();
});

describe("LeaderboardRepositoryImpl", () => {
  it("calculates leaderboard ranking in the database and returns only the top 10 plus current user's rank", async () => {
    mocks.queryRaw.mockResolvedValue([
      {
        userId: "user-1",
        rank: 1,
        name: "Alice",
        gamesPlayed: 2,
        totalScore: 5000,
      },
      {
        userId: "user-2",
        rank: 2,
        name: "Bob",
        gamesPlayed: 1,
        totalScore: 4800,
      },
      {
        userId: "user-12",
        rank: 12,
        name: "Charlie",
        gamesPlayed: 3,
        totalScore: 3500,
      },
    ]);

    const result = await repository.findLeaderboard("user-12");

    expect(result).toEqual({
      entries: [
        {
          rank: 1,
          name: "Alice",
          gamesPlayed: 2,
          totalScore: 5000,
        },
        {
          rank: 2,
          name: "Bob",
          gamesPlayed: 1,
          totalScore: 4800,
        },
      ],
      myRank: {
        rank: 12,
        name: "Charlie",
        gamesPlayed: 3,
        totalScore: 3500,
      },
    });

    expect(mocks.queryRaw).toHaveBeenCalledOnce();

    const [query, userId] = mocks.queryRaw.mock.calls[0];

    expect(query.join("")).toContain("ROW_NUMBER()");
    expect(query.join("")).toContain("COUNT(g.id)");
    expect(query.join("")).toContain('SUM(g."totalScore")');
    expect(query.join("")).toContain("rank <= 10");
    expect(userId).toBe("user-12");
  });

  it("returns null for current user's rank when the user has no completed games", async () => {
    mocks.queryRaw.mockResolvedValue([
      {
        userId: "user-1",
        rank: 1,
        name: "Alice",
        gamesPlayed: 2,
        totalScore: 5000,
      },
    ]);

    const result = await repository.findLeaderboard("user-99");

    expect(result).toEqual({
      entries: [
        {
          rank: 1,
          name: "Alice",
          gamesPlayed: 2,
          totalScore: 5000,
        },
      ],
      myRank: null,
    });
  });

  it("returns an empty leaderboard when there are no completed games", async () => {
    mocks.queryRaw.mockResolvedValue([]);

    const result = await repository.findLeaderboard("user-1");

    expect(result).toEqual({
      entries: [],
      myRank: null,
    });
  });
});
