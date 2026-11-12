import { describe, expect, it, vi } from "vitest";
import { LeaderboardService } from "@/features/leaderboard/server/leaderboard.service";
import type { LeaderboardRepository } from "@/features/leaderboard/server/leaderboard.repository.port";

function createRepository(): LeaderboardRepository {
  return {
    findLeaderboard: vi.fn().mockResolvedValue({
      entries: [
        {
          rank: 1,
          name: "Bob",
          image: null,
          gamesPlayed: 1,
          totalScore: 5000,
        },
        {
          rank: 2,
          name: "Alice",
          image: null,
          gamesPlayed: 2,
          totalScore: 5000,
        },
        {
          rank: 3,
          name: "Charlie",
          image: null,
          gamesPlayed: 2,
          totalScore: 5000,
        },
      ],
      myRank: {
        rank: 2,
        name: "Alice",
        image: null,
        gamesPlayed: 2,
        totalScore: 5000,
      },
    }),
  };
}

describe("LeaderboardService", () => {
  it("returns leaderboard entries and current user's rank", async () => {
    const repository = createRepository();
    const service = new LeaderboardService(repository);

    const result = await service.getLeaderboard("user-1");

    expect(repository.findLeaderboard).toHaveBeenCalledWith("user-1");

    expect(result.entries).toEqual([
      {
        rank: 1,
        name: "Bob",
        image: null,
        gamesPlayed: 1,
        totalScore: 5000,
      },
      {
        rank: 2,
        name: "Alice",
        image: null,
        gamesPlayed: 2,
        totalScore: 5000,
      },
      {
        rank: 3,
        name: "Charlie",
        image: null,
        gamesPlayed: 2,
        totalScore: 5000,
      },
    ]);

    expect(result.myRank).toEqual({
      rank: 2,
      name: "Alice",
      image: null,
      gamesPlayed: 2,
      totalScore: 5000,
    });
  });

  it("returns the current user's rank outside the top 10", async () => {
    const repository = createRepository();

    vi.mocked(repository.findLeaderboard).mockResolvedValue({
      entries: Array.from({ length: 10 }, (_, index) => ({
        rank: index + 1,
        name: `Player ${index + 1}`,
        image: null,
        gamesPlayed: 1,
        totalScore: 5000 - index * 100,
      })),
      myRank: {
        rank: 12,
        name: "Player 12",
        image: null,
        gamesPlayed: 1,
        totalScore: 3900,
      },
    });

    const service = new LeaderboardService(repository);
    const result = await service.getLeaderboard("user-12");

    expect(result.entries).toHaveLength(10);
    expect(result.myRank).toEqual({
      rank: 12,
      name: "Player 12",
      image: null,
      gamesPlayed: 1,
      totalScore: 3900,
    });
  });

});
