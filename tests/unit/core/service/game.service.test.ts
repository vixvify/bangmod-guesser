import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameRepository } from "@/core/ports/game.repository";
import { GameService } from "@/core/service/game.service";

const repository = {
  findById: vi.fn<GameRepository["findById"]>(),
  exitPlayingGame: vi.fn<GameRepository["exitPlayingGame"]>(),
} satisfies GameRepository;
const service = new GameService(repository);
const playing = { id: "game-1", userId: "player-1", status: "PLAYING" as const, finishedAt: null };
const now = new Date("2026-10-27T12:00:00Z");

beforeEach(() => {
  vi.resetAllMocks();
  repository.findById.mockResolvedValue(playing);
  repository.exitPlayingGame.mockResolvedValue({ ...playing, status: "INCOMPLETE", finishedAt: now });
});

describe("GameService.exitGame", () => {
  it("exits an owned playing game and returns only the public result", async () => {
    expect(await service.exitGame("game-1", "player-1", now)).toEqual({
      id: "game-1", status: "INCOMPLETE", finishedAt: now.toISOString(),
    });
    expect(repository.exitPlayingGame).toHaveBeenCalledWith("game-1", "player-1", now);
  });

  it("returns 404 without writing when the game does not exist", async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.exitGame("missing", "player-1")).rejects.toMatchObject({ status: 404 });
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it.each(["PLAYING", "COMPLETED", "INCOMPLETE"] as const)("rejects another player's %s game before writing or returning it", async (status) => {
    repository.findById.mockResolvedValue({ ...playing, status });
    await expect(service.exitGame("game-1", "other-player")).rejects.toMatchObject({ status: 403 });
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it.each(["COMPLETED", "INCOMPLETE"] as const)("preserves an existing %s result and finish time", async (status) => {
    const finishedAt = new Date("2026-10-27T11:00:00Z");
    repository.findById.mockResolvedValue({ ...playing, status, finishedAt });
    expect(await service.exitGame("game-1", "player-1", now)).toEqual({
      id: "game-1", status, finishedAt: finishedAt.toISOString(),
    });
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it("preserves an unavailable legacy finish time on repeated exit", async () => {
    repository.findById.mockResolvedValue({ ...playing, status: "INCOMPLETE" });
    expect((await service.exitGame("game-1", "player-1", now)).finishedAt).toBeNull();
    expect(repository.exitPlayingGame).not.toHaveBeenCalled();
  });

  it("returns the completed result if completion wins after the first read", async () => {
    repository.exitPlayingGame.mockResolvedValue({ ...playing, status: "COMPLETED", finishedAt: now });
    expect((await service.exitGame("game-1", "player-1", now)).status).toBe("COMPLETED");
  });

  it("returns 404 if the owned record disappears before the conditional write", async () => {
    repository.exitPlayingGame.mockResolvedValue(null);
    await expect(service.exitGame("game-1", "player-1", now)).rejects.toMatchObject({ status: 404 });
  });

  it("propagates persistence errors instead of reporting success", async () => {
    repository.exitPlayingGame.mockRejectedValue(new Error("write failed"));
    await expect(service.exitGame("game-1", "player-1", now)).rejects.toThrow("write failed");
  });
});
