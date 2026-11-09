import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";
import { createGameRecord } from "../../fixtures/game";
const { requireAuth, repository } = await vi.hoisted(async () => {
  const { createGameRepositoryMock } = await import("../../mocks/game.repository.mock");
  return { requireAuth: vi.fn(), repository: createGameRepositoryMock() };
});
vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth }));
vi.mock("@/container", async () => {
  const { GameService } = await import("@/features/game/server/game.service");
  return { gameService: new GameService(repository) };
});
import { GET } from "@/app/api/games/[id]/summary/route";
const request = (id = "game-1") => GET(new Request("http://localhost/api/games/game-1/summary"), { params: Promise.resolve({ id }) });
beforeEach(() => {
  vi.resetAllMocks();
  requireAuth.mockResolvedValue({ id: "player-1" });
  const game = createGameRecord();
  game.status = "COMPLETED";
  game.totalScore = 4126;
  game.rounds.forEach((r) => { r.status = "COMPLETED"; r.score = 800; r.playTimeSeconds = 24; r.guessedLatitude = 13.65; r.guessedLongitude = 100.49; });
  repository.findGame.mockResolvedValue(game);
});
describe("GET summary", () => {
  it("returns the final score in the standard envelope without answer details", async () => {
    const response = await request();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ data: { baseScore: 4000, totalTimeSeconds: 120, bonusScore: 126, totalScore: 4126 }, status: 200, statusCode: "SUCCESS" });
  });
  it("requires authentication", async () => { requireAuth.mockRejectedValue(new AppError("Unauthorized", 401)); expect((await request()).status).toBe(401); expect(repository.findGame).not.toHaveBeenCalled(); });
  it("returns 403 for another owner's game", async () => { requireAuth.mockResolvedValue({ id: "other" }); expect((await request()).status).toBe(403); });
  it("returns 404 for missing games", async () => { repository.findGame.mockResolvedValue(null); expect((await request()).status).toBe(404); });
  it("returns 409 before the game finishes", async () => { repository.findGame.mockResolvedValue(createGameRecord()); expect((await request()).status).toBe(409); });
  it("returns 400 for an invalid game ID", async () => { expect((await request(" ")).status).toBe(400); expect(repository.findGame).not.toHaveBeenCalled(); });
  it("hides persistence errors", async () => { repository.findGame.mockRejectedValue(new Error("secret")); expect(await (await request()).json()).toEqual({ error: "Internal server error", status: 500, statusCode: "ERROR" }); });
});
