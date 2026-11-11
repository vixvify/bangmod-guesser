import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";
import { createGameRecord, gameNow } from "../../fixtures/game";
const { requireAuth, repository } = await vi.hoisted(async () => {
  const { createGameRepositoryMock } = await import("../../mocks/game.repository.mock");
  return { requireAuth: vi.fn(), repository: createGameRepositoryMock() };
});
vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth }));
vi.mock("@/container", async () => {
  const { GameService } = await import("@/features/game/server/game.service");
  return { gameService: new GameService(repository) };
});
import { POST } from "@/app/api/games/[id]/rounds/[questionNumber]/guess/route";
const guess = {guessedLatitude:13.65,guessedLongitude:100.49};
const request = (body: unknown = guess, questionNumber = "1", raw = false) => POST(new Request("http://localhost/api/games/game-1/rounds/1/guess", {method:"POST",body:raw ? String(body) : JSON.stringify(body),headers:{"Content-Type":"application/json"}}), {params:Promise.resolve({id:"game-1",questionNumber})});
beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(gameNow.getTime() + 20000));
  requireAuth.mockResolvedValue({id:"player-1"});
  const game = createGameRecord();game.rounds[0].startedAt=gameNow;
  repository.findGame.mockResolvedValue(game);
});
afterEach(() => vi.useRealTimers());
describe("POST guess", () => {
  it("returns the answer with its original image in the standard envelope", async () => {
    const response = await request({...guess,userId:"attacker",score:999999});
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({status:200,statusCode:"SUCCESS",data:{...guess,score:1000,imageUrl:"https://example.test/image-0.webp",location:{name:"Secret answer"}}});
    expect(repository.saveGuess).toHaveBeenCalledWith(expect.objectContaining({userId:"player-1",score:1000}));
  });
  it.each([{},null,{guessedLatitude:"13",guessedLongitude:100}, {guessedLatitude:91,guessedLongitude:100}, {guessedLatitude:13,guessedLongitude:-181}])("rejects invalid coordinates %j", async (body) => {
    expect((await request(body)).status).toBe(400);
    expect(repository.findGame).not.toHaveBeenCalled();
  });
  it.each(["0","6","1.5","01","1e0","abc"])("rejects invalid question path %s", async (question) => {
    expect((await request(guess,question)).status).toBe(400);
    expect(repository.findGame).not.toHaveBeenCalled();
  });
  it("returns 400 for malformed JSON", async () => {expect((await request("{", "1", true)).status).toBe(400);});
  it("requires authentication", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized",401));
    expect((await request()).status).toBe(401);
    expect(repository.findGame).not.toHaveBeenCalled();
  });
  it("rejects non-owners", async () => {
    requireAuth.mockResolvedValue({id:"other"});
    expect((await request()).status).toBe(403);
    expect(repository.saveGuess).not.toHaveBeenCalled();
  });
  it("returns 404 for missing games", async () => {
    repository.findGame.mockResolvedValue(null);
    expect((await request()).status).toBe(404);
  });
  it("returns 409 for a concurrent duplicate without returning an answer", async () => {
    repository.saveGuess.mockRejectedValue(new AppError("Round already answered",409));
    expect(await (await request()).json()).toEqual({error:"Round already answered",status:409,statusCode:"ERROR"});
  });
  it("hides database failure details", async () => {
    repository.saveGuess.mockRejectedValue(new Error("secret connection string"));
    expect(await (await request()).json()).toEqual({error:"Internal server error",status:500,statusCode:"ERROR"});
  });
});
