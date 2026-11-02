import { describe, expect, it, vi } from "vitest";
import { LeaderboardService } from "@/core/service/leaderboard.service";
import type { LeaderboardRepository } from "@/core/ports/leaderboard.repository";

function createRepository(): LeaderboardRepository {
  return {
    findLeaderboardUsers: vi.fn().mockResolvedValue([
      {
        id: "user-1",
        name: "Alice",
        games: [
          { totalScore: 2000 },
          { totalScore: 3000 },
        ],
      },
      {
        id: "user-2",
        name: "Bob",
        games: [{ totalScore: 5000 }],
      },
      {
        id: "user-3",
        name: "Charlie",
        games: [
          { totalScore: 2500 },
          { totalScore: 2500 },
        ],
      },
    ]),
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
                score: 400,
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
  it("sorts by score, games played and name", async () => {
    const repository = createRepository();
    const service = new LeaderboardService(repository);

    const result = await service.getLeaderboard("user-1");

    expect(result.entries.map((entry) => entry.name)).toEqual([
      "Bob",
      "Alice",
      "Charlie",
    ]);

    expect(result.entries[0]).toEqual({
      rank: 1,
      name: "Bob",
      gamesPlayed: 1,
      totalScore: 5000,
    });
  });

  it("returns the current user's rank outside the top 10", async () => {
    const repository = createRepository();

    vi.mocked(repository.findLeaderboardUsers).mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({
        id: `user-${index + 1}`,
        name: `Player ${index + 1}`,
        games: [{ totalScore: 5000 - index * 100 }],
      })),
    );

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

  it("returns profile and closest guess information", async () => {
    const service = new LeaderboardService(createRepository());

    const result = await service.getProfile("user-1", {
      from: "2026-10-01",
      to: "2026-10-31",
    });

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
      bestRoundNumber: 1,
      bestRoundScore: 500,
      bestDistanceMeters: 0,
    });

  });

  it("rejects invalid page numbers", async () => {
    const service = new LeaderboardService(createRepository());

    await expect(
      service.getProfile("user-1", { page: 0 }),
    ).rejects.toThrow("Page must be a positive integer");
  });

  it("rejects invalid date ranges", async () => {
    const service = new LeaderboardService(createRepository());

    await expect(
      service.getProfile("user-1", {
        from: "2026-10-31",
        to: "2026-10-01",
      }),
    ).rejects.toThrow("From date must not be after to date");
  });

  it("rejects invalid date formats", async () => {
    const service = new LeaderboardService(createRepository());

    await expect(
      service.getProfile("user-1", {
        from: "01-10-2026",
      }),
    ).rejects.toThrow("from must use YYYY-MM-DD format");
  });
});