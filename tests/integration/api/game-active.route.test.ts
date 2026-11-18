import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";
import { UserRole } from "@/features/users/user";

const { requireAuth, repository } = await vi.hoisted(async () => {
  const { createGameRepositoryMock } = await import("../../mocks/game.repository.mock");
  return { requireAuth: vi.fn(), repository: createGameRepositoryMock() };
});
vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth }));
vi.mock("@/container", async () => {
  const { GameService } = await import("@/features/game/server/game.service");
  return { gameService: new GameService(repository) };
});
import { GET } from "@/app/api/games/active/route";

function getActive() {
  return GET(new Request("http://localhost/api/games/active", { method: "GET" }), {
    params: Promise.resolve({}),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  requireAuth.mockResolvedValue({
    id: "player-1",
    name: "Player",
    email: "player@example.test",
    role: UserRole.USER,
  });
});

describe("GET /api/games/active", () => {
  it("returns 401 when not authenticated", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));
    const response = await getActive();
    expect(response.status).toBe(401);
  });

  it("returns activeGameId when the user has an active playing game", async () => {
    repository.findActiveGame.mockResolvedValue({
      id: "game-1",
    });
    const response = await getActive();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({
      data: { activeGameId: "game-1" },
      status: 200,
      statusCode: "SUCCESS",
    });
    expect(repository.findActiveGame).toHaveBeenCalledWith("player-1");
  });

  it("returns activeGameId null when user has no active game", async () => {
    repository.findActiveGame.mockResolvedValue(null);
    const response = await getActive();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { activeGameId: null },
      status: 200,
      statusCode: "SUCCESS",
    });
  });
});
