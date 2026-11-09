import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";
const { requireAuth } = vi.hoisted(() => ({ requireAuth: vi.fn() }));
vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth }));
vi.mock("@/container", async () => {
  const { GameService } = await import("@/features/game/server/game.service");
  return { gameService: new GameService(repository) };
});
const { repository } = await vi.hoisted(async () => {
  const { createGameRepositoryMock } = await import("../../mocks/game.repository.mock");
  return { repository: createGameRepositoryMock() };
});
import { POST } from "@/app/api/games/route";

beforeEach(() => {
  vi.resetAllMocks();
  requireAuth.mockResolvedValue({ id: "session-player" });
  repository.findCandidates.mockResolvedValue(Array.from({ length: 5 }, (_, i) => ({ id: `l-${i}`, images: [{ imageNumber: 3 }] })));
  repository.createGame.mockResolvedValue({ id: "created-game" });
});

describe("POST /api/games", () => {
  it("creates the game using only the session owner and returns the standard 201 envelope", async () => {
    const response = await POST();
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ data: { gameId: "created-game" }, status: 201, statusCode: "CREATED" });
    expect(repository.createGame.mock.calls[0][0]).toBe("session-player");
  });
  it("returns 401 before querying locations", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));
    expect((await POST()).status).toBe(401);
    expect(repository.findCandidates).not.toHaveBeenCalled();
  });
  it("returns 409 when there is insufficient content", async () => {
    repository.findCandidates.mockResolvedValue([]);
    expect((await POST()).status).toBe(409);
  });
  it("hides database errors", async () => {
    repository.createGame.mockRejectedValue(new Error("secret database address"));
    expect(await (await POST()).json()).toEqual({ error: "Internal server error", status: 500, statusCode: "ERROR" });
  });
});
