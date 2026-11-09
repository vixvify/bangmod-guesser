import { beforeEach, describe, expect, it } from "vitest";
import { GameService } from "@/features/game/server/game.service";
import { createGameRepositoryMock } from "../../../mocks/game.repository.mock";
import { createGameRecord, gameNow } from "../../../fixtures/game";
const repository = createGameRepositoryMock();
const service = new GameService(repository);
const guess = { guessedLatitude: 13.65, guessedLongitude: 100.49 };
const now = new Date(gameNow.getTime() + 20000);
beforeEach(() => {
  repository.saveGuess.mockReset();
  const game = createGameRecord(); game.rounds[0].startedAt = gameNow;
  repository.findGame.mockResolvedValue(game);
});
describe("GameService.submitGuess", () => {
  it("scores an exact guess, measures time from first open and returns the answer and original image", async () => {
    expect(await service.submitGuess("game-1", "player-1", 1, guess, now)).toEqual({ ...guess, distanceMeters: 0, score: 1000, accumulatedScore: 1000, imageUrl: "https://example.test/image-0.webp", location: { latitude: 13.65, longitude: 100.49, name: "Secret answer", description: "Secret description" } });
    expect(repository.saveGuess).toHaveBeenCalledWith({gameId:"game-1",userId:"player-1",questionNumber:1,...guess,score:1000,playTimeSeconds:20,finishedAt:now});
  });
  it("completes round five with base plus time bonus and ignores time on intermediate result pages", async () => {
    const game = createGameRecord();
    game.startedAt = new Date("2020-01-01");
    game.rounds.forEach((r,i) => { r.startedAt = gameNow; if(i<4) {r.status="COMPLETED";r.score=800;r.playTimeSeconds=25;r.guessedLatitude=13.65;r.guessedLongitude=100.49;} });
    repository.findGame.mockResolvedValue(game);
    expect((await service.submitGuess(game.id,game.userId,5,guess,now)).accumulatedScore).toBe(4200);
    expect(repository.saveGuess).toHaveBeenCalledWith(expect.objectContaining({totalScore:4326,questionNumber:5,playTimeSeconds:20}));
  });
  it.each([0,2,5,6])("rejects out of order round %s without saving", async (question) => {
    await expect(service.submitGuess("game-1","player-1",question,guess,now)).rejects.toMatchObject({status:409});
    expect(repository.saveGuess).not.toHaveBeenCalled();
  });
  it("rejects unopened rounds", async () => {
    repository.findGame.mockResolvedValue(createGameRecord());
    await expect(service.submitGuess("game-1","player-1",1,guess)).rejects.toMatchObject({status:409});
  });
  it.each(["COMPLETED","INCOMPLETE"] as const)("rejects a %s game", async (status) => {
    repository.findGame.mockResolvedValue({...createGameRecord(),status});
    await expect(service.submitGuess("game-1","player-1",1,guess)).rejects.toMatchObject({status:409});
    expect(repository.saveGuess).not.toHaveBeenCalled();
  });
  it("does not reveal the answer if another submit wins the conditional write", async () => {
    const { AppError } = await import("@/shared/errors/app.error");
    repository.saveGuess.mockRejectedValue(new AppError("Already answered",409));
    await expect(service.submitGuess("game-1","player-1",1,guess,now)).rejects.toMatchObject({status:409});
  });
  it.each(["time", "coordinates"])("rejects incomplete previous %s before completing another round", async (missing) => {
    const game = createGameRecord();
    game.rounds[0] = { ...game.rounds[0], status: "COMPLETED", score: 800,
      playTimeSeconds: missing === "time" ? null : 20,
      guessedLatitude: missing === "coordinates" ? null : 13.65,
      guessedLongitude: 100.49 };
    game.rounds[1].startedAt = gameNow;
    repository.findGame.mockResolvedValue(game);
    await expect(service.submitGuess(game.id, game.userId, 2, guess, now)).rejects.toMatchObject({ status: 409 });
    expect(repository.saveGuess).not.toHaveBeenCalled();
  });

  it("uses the shared distance calculation for a guess 25 metres away", async () => {
    const north = { ...guess, guessedLatitude: guess.guessedLatitude + 25 / 6371000 * 180 / Math.PI };
    const result = await service.submitGuess("game-1", "player-1", 1, north, now);
    expect(result.distanceMeters).toBe(25);
    expect(result.score).toBe(700);
  });

});
