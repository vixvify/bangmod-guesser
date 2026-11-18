import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { repository } = await vi.hoisted(async () => {
  const { createGameRepositoryMock } = await import("../../mocks/game.repository.mock");
  return { repository: createGameRepositoryMock() };
});
vi.mock("@/container", async () => {
  const { GameService } = await import("@/features/game/server/game.service");
  return { gameService: new GameService(repository) };
});
import { POST } from "@/app/api/games/[id]/terminate/route";

const now = new Date("2026-10-27T12:00:00Z");
const playing = { id: "game-1", userId: "player-1", status: "PLAYING" as const, finishedAt: null };
const terminated = { ...playing, status: "INCOMPLETE" as const, finishedAt: now };

function terminate(id = "game-1") {
  return POST(new Request(`http://localhost/api/games/${encodeURIComponent(id)}/terminate`, {
    method: "POST",
  }), { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  repository.findById.mockResolvedValue(playing);
  repository.exitPlayingGame.mockResolvedValue(terminated);
});
afterEach(() => { vi.useRealTimers(); });

describe("POST /api/games/[id]/terminate", () => {
  it("terminates a playing game without requiring an active session", async () => {
    const response = await terminate("game-1");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({
      data: { id: "game-1", status: "INCOMPLETE", finishedAt: now.toISOString() },
      status: 200,
      statusCode: "SUCCESS",
    });
    expect(repository.findById).toHaveBeenCalledWith("game-1");
    expect(repository.exitPlayingGame).toHaveBeenCalledWith("game-1", "player-1", now);
  });

  it("returns 404 for an unknown game", async () => {
    repository.findById.mockResolvedValue(null);
    const response = await terminate("missing");
    expect(response.status).toBe(404);
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it("is idempotent and preserves already ended or completed game", async () => {
    const finishedAt = new Date("2026-10-27T11:00:00Z");
    repository.findById.mockResolvedValue({ ...playing, status: "COMPLETED", finishedAt });
    const response = await terminate("game-1");
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({
      id: "game-1",
      status: "COMPLETED",
      finishedAt: finishedAt.toISOString(),
    });
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it.each(["", "   ", "x".repeat(129)])("returns 400 for an invalid game ID", async (id) => {
    const response = await terminate(id);
    expect(response.status).toBe(400);
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
