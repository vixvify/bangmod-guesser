import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameRepositoryImpl } from "@/infrastructure/repositories/game.repository";
import { gameStateSelect } from "../../../../prisma/types/game";

const { findUnique, updateMany, transaction } = vi.hoisted(() => ({
  findUnique: vi.fn(), updateMany: vi.fn(), transaction: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { game: { findUnique }, $transaction: transaction },
}));

const repository = new GameRepositoryImpl();
const now = new Date("2026-10-27T12:00:00Z");
const record = { id: "game-1", userId: "player-1", status: "INCOMPLETE", finishedAt: now };

beforeEach(() => {
  vi.resetAllMocks();
  findUnique.mockResolvedValue(record);
  updateMany.mockResolvedValue({ count: 1 });
  transaction.mockImplementation(async (operation) => operation({ game: { findUnique, updateMany } }));
});

describe("GameRepositoryImpl", () => {
  it("selects just the fields needed for ownership and exit results", async () => {
    expect(await repository.findById("game-1")).toEqual(record);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: "game-1" }, select: gameStateSelect });
    expect(gameStateSelect).toEqual({ id: true, userId: true, status: true, finishedAt: true });
  });

  it("conditionally changes only the owner's PLAYING game in a transaction", async () => {
    expect(await repository.exitPlayingGame("game-1", "player-1", now)).toEqual(record);
    expect(transaction).toHaveBeenCalledOnce();
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "game-1", userId: "player-1", status: "PLAYING" },
      data: { status: "INCOMPLETE", finishedAt: now },
    });
    expect(findUnique).toHaveBeenCalledWith({ where: { id: "game-1", userId: "player-1" }, select: gameStateSelect });
    expect(updateMany.mock.invocationCallOrder[0]).toBeLessThan(findUnique.mock.invocationCallOrder[0]);
  });

  it("returns the persisted terminal state when the conditional write affects no rows", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    findUnique.mockResolvedValue({ ...record, status: "COMPLETED" });
    expect((await repository.exitPlayingGame("game-1", "player-1", now))?.status).toBe("COMPLETED");
    expect(updateMany).toHaveBeenCalledOnce();
  });

  it("returns null when no owned game remains", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    findUnique.mockResolvedValue(null);
    expect(await repository.exitPlayingGame("missing", "player-1", now)).toBeNull();
  });

  it("does not read a successful result after a failed write", async () => {
    updateMany.mockRejectedValue(new Error("write failed"));
    await expect(repository.exitPlayingGame("game-1", "player-1", now)).rejects.toThrow("write failed");
    expect(findUnique).not.toHaveBeenCalled();
  });
});
