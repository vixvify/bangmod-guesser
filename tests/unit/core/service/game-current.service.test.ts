import { describe, expect, it } from "vitest";
import { GameService } from "@/features/game/server/game.service";
import { createGameRepositoryMock } from "../../../mocks/game.repository.mock";
import { createGameRecord, gameNow } from "../../../fixtures/game";

describe("GameService.currentRound", () => {
  it("returns only the persisted question and image, never answer data", async () => {
    const repository = createGameRepositoryMock();
    const game = createGameRecord();
    game.rounds[0].startedAt = gameNow;
    repository.findGame.mockResolvedValue(game);
    repository.openRound.mockResolvedValue(game);
    const service = new GameService(repository);
    expect(await service.currentRound(game.id, game.userId, gameNow)).toEqual({ questionNumber: 1, imageUrl: game.rounds[0].locationImage?.imageUrl, deadlineAt: new Date(gameNow.getTime() + 40000).toISOString() });
    expect(repository.openRound).toHaveBeenCalledWith(game.id, game.userId, 1, gameNow);
  });
  it.each(["COMPLETED", "INCOMPLETE"] as const)("rejects %s games", async (status) => {
    const repository = createGameRepositoryMock();
    repository.findGame.mockResolvedValue({ ...createGameRecord(), status });
    await expect(new GameService(repository).currentRound("game-1", "player-1")).rejects.toMatchObject({ status: 409 });
    expect(repository.openRound).not.toHaveBeenCalled();
  });
  it("refuses a legacy pending round without an assigned image", async () => {
    const repository = createGameRepositoryMock();
    const game = createGameRecord(); game.rounds[0].locationImage = null;
    repository.findGame.mockResolvedValue(game);
    await expect(new GameService(repository).currentRound(game.id, game.userId)).rejects.toMatchObject({status:409});
  });
});
