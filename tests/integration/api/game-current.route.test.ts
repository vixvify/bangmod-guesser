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
import { GET } from "@/app/api/games/[id]/current-round/route";
const request = (id = "game-1") => GET(new Request("http://localhost/api/games/game-1/current-round"), {params: Promise.resolve({id})});
beforeEach(() => {
  vi.resetAllMocks();
  requireAuth.mockResolvedValue({ id: "player-1" });
  repository.findGame.mockResolvedValue(createGameRecord());
  repository.openRound.mockResolvedValue(createGameRecord());
});
describe("GET current-round", () => {
  it("returns the same question and image on repeated reads without leaking the answer", async () => {
    const response = await request();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const body = await response.json();
    expect(body).toEqual({data:{questionNumber:1,imageUrl:"https://example.test/image-0.webp"},status:200,statusCode:"SUCCESS"});
    expect(await (await request()).json()).toEqual(body);
  });
  it("requires authentication before querying", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));
    expect((await request()).status).toBe(401);
    expect(repository.findGame).not.toHaveBeenCalled();
  });
  it("rejects another owner", async () => {
    requireAuth.mockResolvedValue({id:"other"});
    expect((await request()).status).toBe(403);
    expect(repository.openRound).not.toHaveBeenCalled();
  });
  it("returns 404 for a missing game", async () => {
    repository.findGame.mockResolvedValue(null);
    expect((await request()).status).toBe(404);
  });
  it("rejects an invalid game identifier", async () => {
    expect((await request(" ")).status).toBe(400);
    expect(repository.findGame).not.toHaveBeenCalled();
  });
});
