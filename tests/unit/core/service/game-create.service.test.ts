import { describe, expect, it } from "vitest";
import { GameService } from "@/features/game/server/game.service";
import { createGameRepositoryMock } from "../../../mocks/game.repository.mock";

const candidates = Array.from({ length: 7 }, (_, i) => ({ id: `location-${i}`, images: [{ imageNumber: 2 }, { imageNumber: 5 }] }));

describe("GameService.createGame", () => {
  it("preselects five distinct locations and an existing image for every round", async () => {
    const repository = createGameRepositoryMock();
    repository.findCandidates.mockResolvedValue(structuredClone(candidates));
    repository.createGame.mockResolvedValue({ id: "game-1" });
    expect(await new GameService(repository).createGame("player")).toEqual({ gameId: "game-1" });
    const [userId, rounds] = repository.createGame.mock.calls[0];
    expect(userId).toBe("player");
    expect(rounds.map((r) => r.questionNumber)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(rounds.map((r) => r.locationId)).size).toBe(5);
    for (const round of rounds) expect([2, 5]).toContain(round.imageNumber);
  });

  it("does not create a partial game when fewer than five locations qualify", async () => {
    const repository = createGameRepositoryMock();
    repository.findCandidates.mockResolvedValue(candidates.slice(0, 4));
    await expect(new GameService(repository).createGame("player")).rejects.toMatchObject({ status: 409 });
    expect(repository.createGame).not.toHaveBeenCalled();
  });

  it("propagates an atomic creation failure", async () => {
    const repository = createGameRepositoryMock();
    repository.findCandidates.mockResolvedValue(structuredClone(candidates));
    repository.createGame.mockRejectedValue(new Error("transaction rolled back"));
    await expect(new GameService(repository).createGame("player")).rejects.toThrow("transaction rolled back");
  });
});
