import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameService } from "@/features/game/server/game.service";
import { createGameRepositoryMock } from "../../../mocks/game.repository.mock";
import { createGameRecord, gameNow } from "../../../fixtures/game";

const repository = createGameRepositoryMock();
const service = new GameService(repository);
const guess = { guessedLatitude: 13.65, guessedLongitude: 100.49 };

beforeEach(() => {
  vi.resetAllMocks();
  const game = createGameRecord();
  game.rounds[0].startedAt = gameNow;
  repository.findGame.mockResolvedValue(game);
});

describe("server round deadlines", () => {
  it.each([40_000, 40_001, 90_000])("records a zero-point timeout for a request received %s ms after opening", async (elapsed) => {
    const result = await service.submitGuess("game-1", "player-1", 1, guess, new Date(gameNow.getTime() + elapsed));
    expect(result).toMatchObject({ score: 0, guessedLatitude: null, guessedLongitude: null, distanceMeters: null, timedOut: true });
    expect(repository.saveGuess).toHaveBeenCalledWith(expect.objectContaining({ score: 0, playTimeSeconds: 40, guessedLatitude: null, guessedLongitude: null }));
  });

  it("accepts a request received just before the server deadline", async () => {
    expect(await service.submitGuess("game-1", "player-1", 1, guess, new Date(gameNow.getTime() + 39_999)))
      .toMatchObject({ score: 1000, timedOut: false });
    expect(repository.saveGuess).toHaveBeenCalledWith(expect.objectContaining({ playTimeSeconds: 39 }));
  });
  it("allows an empty timeout submission only after the server deadline", async () => {
    const empty = { guessedLatitude: null, guessedLongitude: null };
    await expect(service.submitGuess("game-1", "player-1", 1, empty, new Date(gameNow.getTime() + 39_999)))
      .rejects.toMatchObject({ status: 409 });
    expect(repository.saveGuess).not.toHaveBeenCalled();
    expect(await service.submitGuess("game-1", "player-1", 1, empty, new Date(gameNow.getTime() + 40_000)))
      .toMatchObject({ score: 0, timedOut: true });
  });

  it("finishes a game when its fifth round times out", async () => {
    const game = createGameRecord();
    game.rounds.forEach((round, index) => {
      round.startedAt = gameNow;
      if (index < 4) Object.assign(round, { status: "COMPLETED", score: 800, playTimeSeconds: 20, ...guess });
    });
    repository.findGame.mockResolvedValue(game);
    expect(await service.submitGuess(game.id, game.userId, 5, guess, new Date(gameNow.getTime() + 40_000)))
      .toMatchObject({ score: 0, timedOut: true, accumulatedScore: 3200 });
    expect(repository.saveGuess).toHaveBeenCalledWith(expect.objectContaining({ totalScore: 3326, playTimeSeconds: 40 }));
  });

  it("allows subsequent rounds and the final summary after timeouts", async () => {
    const game = createGameRecord();
    game.status = "COMPLETED";
    game.totalScore = 0;
    game.rounds.forEach((round) => Object.assign(round, {
      status: "COMPLETED", score: 0, playTimeSeconds: 40, startedAt: gameNow,
    }));
    repository.findGame.mockResolvedValue(game);
    expect(await service.summary(game.id, game.userId)).toEqual({ baseScore: 0, totalTimeSeconds: 200, bonusScore: 0, totalScore: 0 });
    expect(await service.roundResult(game.id, game.userId, 5)).toMatchObject({ timedOut: true, score: 0 });
  });

  it("allows the next round after the previous one timed out", async () => {
    const game = createGameRecord();
    Object.assign(game.rounds[0], { status: "COMPLETED", score: 0, playTimeSeconds: 40, startedAt: gameNow });
    game.rounds[1].startedAt = new Date(gameNow.getTime() + 60_000);
    repository.findGame.mockResolvedValue(game);
    expect(await service.submitGuess(game.id, game.userId, 2, guess, new Date(gameNow.getTime() + 80_000)))
      .toMatchObject({ score: 1000, timedOut: false, accumulatedScore: 1000 });
  });

});


describe("reading recorded round results", () => {
  it.each(["PLAYING", "COMPLETED", "INCOMPLETE"] as const)("returns the saved score after a lost response in a %s game without writing again", async (status) => {
    const game = createGameRecord();
    game.status = status;
    Object.assign(game.rounds[0], { status: "COMPLETED", score: 700, playTimeSeconds: 20, startedAt: gameNow, ...guess });
    game.rounds[1].score = 1000;
    repository.findGame.mockResolvedValue(game);
    const result = await service.roundResult(game.id, game.userId, 1);
    expect(result).toMatchObject({ ...guess, score: 700, accumulatedScore: 700, timedOut: false });
    expect(await service.roundResult(game.id, game.userId, 1)).toEqual(result);
    expect(repository.saveGuess).not.toHaveBeenCalled();
  });

  it("does not leak an unanswered round", async () => {
    await expect(service.roundResult("game-1", "player-1", 1)).rejects.toMatchObject({ status: 409 });
  });

  it("checks ownership before revealing a recorded result", async () => {
    await expect(service.roundResult("game-1", "other-player", 1)).rejects.toMatchObject({ status: 403 });
  });

  it("returns 404 for a missing game or round", async () => {
    await expect(service.roundResult("game-1", "player-1", 6)).rejects.toMatchObject({ status: 404 });
    repository.findGame.mockResolvedValue(null);
    await expect(service.roundResult("missing", "player-1", 1)).rejects.toMatchObject({ status: 404 });
  });

  it("can still read score and coordinates if an old game image has been removed", async () => {
    const game = createGameRecord();
    Object.assign(game.rounds[0], { status: "COMPLETED", score: 700, playTimeSeconds: 20, ...guess, locationImage: null });
    repository.findGame.mockResolvedValue(game);
    expect(await service.roundResult(game.id, game.userId, 1)).toMatchObject({ score: 700, imageUrl: null });
  });
});
