import { describe, expect, it, vi } from "vitest";
import { ProfileService } from "@/features/profile/server/profile.service";
import type { ProfileRepository } from "@/features/profile/server/profile.repository.port";

function createRepository(): ProfileRepository {
  return {
    findProfile: vi.fn().mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        games: [{
          id: "game-1",
          status: "COMPLETED",
          startedAt: new Date("2026-10-20T10:00:00.000Z"),
          totalScore: 4800,
          rounds: [
            { questionNumber: 1, guessedLatitude: 13.7563, guessedLongitude: 100.5018,
              score: 500, location: { latitude: 13.7563, longitude: 100.5018 } },
            { questionNumber: 2, guessedLatitude: 13.8, guessedLongitude: 100.6,
              score: 600, location: { latitude: 13.7563, longitude: 100.5018 } },
          ],
        }],
      },
      totalGames: 5,
    }),
  };
}

describe("ProfileService", () => {
  it("uses the selected Bangkok dates and returns game history", async () => {
    const repository = createRepository();
    const service = new ProfileService(repository);
    const result = await service.getProfile("user-1", {
      from: "2026-10-01", to: "2026-10-31", page: 1,
    });

    expect(repository.findProfile).toHaveBeenCalledWith("user-1", {
      from: new Date("2026-09-30T17:00:00.000Z"),
      toExclusive: new Date("2026-10-31T17:00:00.000Z"),
      page: 1,
      pageSize: 4,
    });
    expect(result).toMatchObject({
      id: "user-1", name: "Alice", email: "alice@example.com",
      pagination: { page: 1, pageSize: 4, totalGames: 5, totalPages: 2 },
    });
    expect(result.games[0]).toMatchObject({
      id: "game-1", totalScore: 4800, grade: "SSS",
      bestRoundNumber: 2, bestRoundScore: 600, bestDistanceMeters: 0,
    });
  });

  it("rejects a missing user", async () => {
    const repository = createRepository();
    vi.mocked(repository.findProfile).mockResolvedValue({ user: null, totalGames: 0 });
    await expect(new ProfileService(repository).getProfile("missing", { page: 1 }))
      .rejects.toMatchObject({ status: 404 });
  });
});
