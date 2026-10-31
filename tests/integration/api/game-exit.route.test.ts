import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/core/errors/app.error";
import type { GameRepository } from "@/core/ports/game.repository";
import { UserRole } from "@/core/domain/user";

const { requireAuth, repository } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  repository: {
    findById: vi.fn<GameRepository["findById"]>(),
    exitPlayingGame: vi.fn<GameRepository["exitPlayingGame"]>(),
  },
}));
vi.mock("@/lib/auth-check", () => ({ requireAuth }));
vi.mock("@/infrastructure/container", async () => {
  const { GameService } = await import("@/core/service/game.service");
  return { gameService: new GameService(repository) };
});
import { POST } from "@/app/api/games/[id]/exit/route";

const now = new Date("2026-10-27T12:00:00Z");
const playing = { id: "game-1", userId: "player-1", status: "PLAYING" as const, finishedAt: null };
const exited = { ...playing, status: "INCOMPLETE" as const, finishedAt: now };

function exit(id = "game-1", body?: unknown) {
  return POST(new Request(`http://localhost/api/games/${encodeURIComponent(id)}/exit`, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
  }), { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  requireAuth.mockResolvedValue({ id: "player-1", name: "Player", email: "player@example.test", role: UserRole.USER });
  repository.findById.mockResolvedValue(playing);
  repository.exitPlayingGame.mockResolvedValue(exited);
});
afterEach(() => { vi.useRealTimers(); });

describe("POST /api/games/[id]/exit through the real service and factory", () => {
  it("lets an ordinary owner exit without a JSON body and returns the shared response", async () => {
    const response = await exit();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({
      data: { id: "game-1", status: "INCOMPLETE", finishedAt: now.toISOString() },
      status: 200, statusCode: "SUCCESS",
    });
    expect(repository.exitPlayingGame).toHaveBeenCalledWith("game-1", "player-1", now);
  });

  it("uses the session identity and server time instead of body fields", async () => {
    await exit(" game-1 ", { userId: "other-player", status: "COMPLETED", totalScore: 5000, finishedAt: "2000-01-01" });
    expect(repository.findById).toHaveBeenCalledWith("game-1");
    expect(repository.exitPlayingGame).toHaveBeenCalledWith("game-1", "player-1", now);
  });

  it("returns 401 before reading any game when not authenticated", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));
    expect((await exit()).status).toBe(401);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it.each([UserRole.USER, UserRole.ADMIN])("rejects a non-owner with role %s even when the body claims ownership", async (role) => {
    requireAuth.mockResolvedValue({ id: "other-player", role });
    const response = await exit("game-1", { userId: "player-1" });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden", status: 403, statusCode: "ERROR" });
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown game", async () => {
    repository.findById.mockResolvedValue(null);
    expect((await exit("missing")).status).toBe(404);
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it.each(["", "   ", "x".repeat(129)])("returns 400 for an invalid game ID", async (id) => {
    expect((await exit(id)).status).toBe(400);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("returns the same result on retry without changing the original finish time", async () => {
    repository.findById.mockResolvedValueOnce(playing).mockResolvedValueOnce(exited);
    const first = await (await exit()).json();
    vi.setSystemTime(new Date("2026-10-27T13:00:00Z"));
    expect(await (await exit()).json()).toEqual(first);
    expect(repository.exitPlayingGame).toHaveBeenCalledOnce();
  });

  it("preserves a completed game", async () => {
    const finishedAt = new Date("2026-10-27T11:00:00Z");
    repository.findById.mockResolvedValue({ ...playing, status: "COMPLETED", finishedAt });
    const response = await exit();
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ id: "game-1", status: "COMPLETED", finishedAt: finishedAt.toISOString() });
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it("returns completion if it wins the race with exit", async () => {
    repository.exitPlayingGame.mockResolvedValue({ ...playing, status: "COMPLETED", finishedAt: now });
    expect((await (await exit()).json()).data.status).toBe("COMPLETED");
  });

  it("returns 404 when the record disappears during exit", async () => {
    repository.exitPlayingGame.mockResolvedValue(null);
    expect((await exit()).status).toBe(404);
  });

  it("hides persistence failure details instead of reporting a successful exit", async () => {
    repository.exitPlayingGame.mockRejectedValue(new Error("private connection details"));
    const response = await exit();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error", status: 500, statusCode: "ERROR" });
  });
});
