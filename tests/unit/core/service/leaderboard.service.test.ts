import { describe, expect, it, vi } from "vitest";
import { LeaderboardService } from "@/core/service/leaderboard.service";
import type { LeaderboardRepository } from "@/core/ports/leaderboard.repository";

function createRepository(): LeaderboardRepository {
  return {
    findLeaderboard: vi.fn().mockResolvedValue({
      entries: [
        {
          rank: 1,
          name: "Bob",
          gamesPlayed: 1,
          totalScore: 5000,
        },
        {
          rank: 2,
          name: "Alice",
          gamesPlayed: 2,
          totalScore: 5000,
        },
        {
          rank: 3,
          name: "Charlie",
          gamesPlayed: 2,
          totalScore: 5000,
        },
      ],
      myRank: {
        rank: 2,
        name: "Alice",
        gamesPlayed: 2,
        totalScore: 5000,
      },
    }),
    findProfile: vi.fn().mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        games: [
          {
            id: "game-1",
            status: "COMPLETED",
            startedAt: new Date("2026-10-20T10:00:00.000Z"),
            totalScore: 4800,
            rounds: [
              {
                questionNumber: 1,
                guessedLatitude: 13.7563,
                guessedLongitude: 100.5018,
                score: 500,
                location: {
                  latitude: 13.7563,
                  longitude: 100.5018,
                },
              },
              {
                questionNumber: 2,
                guessedLatitude: 13.8,
                guessedLongitude: 100.6,
                score: 600,
                location: {
                  latitude: 13.7563,
                  longitude: 100.5018,
                },
              },
            ],
          },
        ],
      },
      totalGames: 5,
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
        gamesPlayed: 1,
        totalScore: 5000,
      },
      {
        rank: 2,
        name: "Alice",
        gamesPlayed: 2,
        totalScore: 5000,
      },
      {
        rank: 3,
        name: "Charlie",
        gamesPlayed: 2,
        totalScore: 5000,
      },
    ]);

    expect(result.myRank).toEqual({
      rank: 2,
      name: "Alice",
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
        gamesPlayed: 1,
        totalScore: 5000 - index * 100,
      })),
      myRank: {
        rank: 12,
        name: "Player 12",
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
      gamesPlayed: 1,
      totalScore: 3900,
    });
  });

  it("returns the highest scoring round independently from the closest guess", async () => {
    const repository = createRepository();
    const service = new LeaderboardService(repository);

    const result = await service.getProfile("user-1", {
      from: "2026-10-01",
      to: "2026-10-31",
      page: 1,
    });

    expect(repository.findProfile).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        from: new Date("2026-09-30T17:00:00.000Z"),
        toExclusive: new Date("2026-10-31T17:00:00.000Z"),
        page: 1,
        pageSize: 4,
      }),
    );

    expect(result).toMatchObject({
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      pagination: {
        page: 1,
        pageSize: 4,
        totalGames: 5,
        totalPages: 2,
      },
    });

    expect(result.games[0]).toMatchObject({
      id: "game-1",
      totalScore: 4800,
      grade: "SSS",
      bestRoundNumber: 2,
      bestRoundScore: 600,
      bestDistanceMeters: 0,
    });
  });
});
