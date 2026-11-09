import { beforeEach, describe, expect, it } from "vitest";
import { GameService } from "@/features/game/server/game.service";
import { createGameRepositoryMock } from "../../../mocks/game.repository.mock";
import { createGameRecord } from "../../../fixtures/game";
const repository = createGameRepositoryMock();
const service = new GameService(repository);
function completedGame() {
  const game = createGameRecord();
  game.status = "COMPLETED";
  game.rounds.forEach((r) => { r.status = "COMPLETED"; r.score = 800; r.playTimeSeconds = 24; r.guessedLatitude = 13.65; r.guessedLongitude = 100.49; });
  return game;
}
beforeEach(() => { repository.findGame.mockResolvedValue(completedGame()); });
describe("GameService.summary", () => {
  it("sums five answers and adds the time bonus once", async () => {
    const expected = { baseScore: 4000, totalTimeSeconds: 120, bonusScore: 500, totalScore: 4500 };
    expect(await service.summary("game-1", "player-1")).toEqual(expected);
    expect(await service.summary("game-1", "player-1")).toEqual(expected);
    expect(repository.saveGuess).not.toHaveBeenCalled();
  });
  it.each(["PLAYING", "INCOMPLETE"] as const)("rejects %s games", async (status) => {
    repository.findGame.mockResolvedValue({ ...completedGame(), status });
    await expect(service.summary("game-1", "player-1")).rejects.toMatchObject({ status: 409 });
  });
  it("requires all five answer results even when the game claims completion", async () => {
    const game = completedGame();
    game.rounds.pop();
    repository.findGame.mockResolvedValue(game);
    await expect(service.summary("game-1", "player-1")).rejects.toMatchObject({ status: 409 });
  });
  it("rejects legacy incomplete timing or missing answer data", async () => {
    const game = completedGame();
    game.rounds[2].playTimeSeconds = null;
    repository.findGame.mockResolvedValue(game);
    await expect(service.summary("game-1", "player-1")).rejects.toMatchObject({ status: 409 });
  });
  it("rejects another owner before revealing the result", async () => {
    await expect(service.summary("game-1", "other")).rejects.toMatchObject({ status: 403 });
  });
});
