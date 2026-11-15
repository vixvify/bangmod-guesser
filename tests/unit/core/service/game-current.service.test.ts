import { describe, expect, it } from "vitest";
import { GameService } from "@/features/game/server/game.service";
import { createGameRepositoryMock } from "../../../mocks/game.repository.mock";
import { createGameRecord, gameNow } from "../../../fixtures/game";

describe("GameService.currentRound", () => {
  it("returns the image without starting the round", async () => {
    const repository = createGameRepositoryMock();
    const game = createGameRecord();
    repository.findGame.mockResolvedValue(game);
    const service = new GameService(repository);
    expect(await service.currentRound(game.id, game.userId)).toEqual({ questionNumber: 1, imageUrl: game.rounds[0].locationImage?.imageUrl, deadlineAt: null });
    expect(repository.openRound).not.toHaveBeenCalled();
  });
  it("starts the requested current round and returns the deadline", async () => {
    const repository = createGameRepositoryMock();
    const game = createGameRecord();
    repository.findGame.mockResolvedValue(game);
    const opened = createGameRecord();
    opened.rounds[0].startedAt = gameNow;
    repository.openRound.mockResolvedValue(opened);
    expect(await new GameService(repository).startRound(game.id, game.userId, 1, gameNow)).toEqual({ questionNumber: 1, imageUrl: opened.rounds[0].locationImage?.imageUrl, deadlineAt: new Date(gameNow.getTime() + 40000).toISOString() });
    expect(repository.openRound).toHaveBeenCalledWith(game.id, game.userId, 1, gameNow);
  });
  it("rejects an outdated round start request", async () => {
    const repository = createGameRepositoryMock();
    const game = createGameRecord();
    repository.findGame.mockResolvedValue(game);
    await expect(new GameService(repository).startRound(game.id, game.userId, 2)).rejects.toMatchObject({ status: 409 });
    expect(repository.openRound).not.toHaveBeenCalled();
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
