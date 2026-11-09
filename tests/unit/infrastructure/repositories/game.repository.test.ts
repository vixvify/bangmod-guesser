import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameRepositoryImpl } from "@/features/game/server/game.repository";
import { gameStateSelect } from "../../../../prisma/types/game";

const { findUnique, updateMany, transaction, findMany, create, queryRaw, findImage } = vi.hoisted(() => ({
  findUnique: vi.fn(), updateMany: vi.fn(), transaction: vi.fn(),
  findMany: vi.fn(), create: vi.fn(), queryRaw: vi.fn(), findImage: vi.fn(),
}));
vi.mock("@/shared/lib/prisma", () => ({
  prisma: { location: { findMany }, game: { findUnique }, $transaction: transaction },
}));

const repository = new GameRepositoryImpl();
const now = new Date("2026-10-27T12:00:00Z");
const record = { id: "game-1", userId: "player-1", status: "INCOMPLETE", finishedAt: now };

beforeEach(() => {
  vi.resetAllMocks();
  findUnique.mockResolvedValue(record);
  updateMany.mockResolvedValue({ count: 1 });
  transaction.mockImplementation(async (operation) => operation({ game: { findUnique, updateMany, create }, locationImage: { findUnique: findImage }, $queryRaw: queryRaw }));
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


describe("GameRepositoryImpl creation", () => {
  const rounds = Array.from({ length: 5 }, (_, i) => ({ questionNumber: i + 1, locationId: `l-${i}`, imageNumber: 2 }));
  it("queries only active locations with at least one image", async () => {
    findMany.mockResolvedValue([]);
    await repository.findCandidates();
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: "ACTIVE", images: { some: {} } } }));
  });
  it("creates all rounds in one nested transaction after validating selected images", async () => {
    findImage.mockResolvedValue({ location: { status: "ACTIVE" } });
    create.mockResolvedValue({ id: "new-game" });
    expect(await repository.createGame("player", rounds)).toEqual({ id: "new-game" });
    expect(queryRaw).toHaveBeenCalledTimes(5);
    expect(create).toHaveBeenCalledWith({ data: { userId: "player", status: "PLAYING", rounds: { create: rounds.map((r) => ({ ...r, status: "PENDING" })) } }, select: { id: true } });
  });
  it("does not create anything if a chosen image disappeared", async () => {
    findImage.mockResolvedValue(null);
    await expect(repository.createGame("player", rounds)).rejects.toMatchObject({ status: 409 });
    expect(create).not.toHaveBeenCalled();
  });
});
