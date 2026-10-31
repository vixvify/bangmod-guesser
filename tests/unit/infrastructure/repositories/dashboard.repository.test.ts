import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardQuerySchema } from "@/core/schema/dashboard.schema";
import { DASHBOARD_TIME_ZONE } from "@/core/constants/dashboard";
import { dashboardGame, dashboardRound } from "../../../fixtures/dashboard";

const mocks = vi.hoisted(() => ({
  gameCount: vi.fn(), gameFindMany: vi.fn(), gameGroupBy: vi.fn(), userCount: vi.fn(),
  roundAggregate: vi.fn(), roundFindMany: vi.fn(), daily: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: {
  game: { count: mocks.gameCount, findMany: mocks.gameFindMany, groupBy: mocks.gameGroupBy },
  user: { count: mocks.userCount }, gameRound: { aggregate: mocks.roundAggregate, findMany: mocks.roundFindMany },
  $queryRaw: mocks.daily,
} }));
import { DashboardRepositoryImpl } from "@/infrastructure/repositories/dashboard.repository";

const repository = new DashboardRepositoryImpl();
const range = { start: new Date("2026-10-26T17:00:00Z"), endExclusive: new Date("2026-10-27T17:00:00Z") };
const dateFilter = { gte: range.start, lt: range.endExclusive };
beforeEach(() => { vi.resetAllMocks(); });

describe("DashboardRepositoryImpl", () => {
  it("uses a date condition for selected counts and no date condition for the all-time baseline", async () => {
    mocks.gameGroupBy.mockResolvedValue([]);
    await repository.groupGames(range);
    await repository.groupGames();
    expect(mocks.gameGroupBy).toHaveBeenNthCalledWith(1, { by: ["status"], where: { startedAt: dateFilter }, _count: { _all: true } });
    expect(mocks.gameGroupBy).toHaveBeenNthCalledWith(2, { by: ["status"], where: {}, _count: { _all: true } });
  });

  it("counts unique users through game participation and counts playing users without a historical date filter", async () => {
    mocks.userCount.mockResolvedValue(2);
    await repository.countPlayers(range);
    await repository.countPlayingPlayers();
    expect(mocks.userCount).toHaveBeenNthCalledWith(1, { where: { games: { some: { startedAt: dateFilter } } } });
    expect(mocks.userCount).toHaveBeenNthCalledWith(2, { where: { games: { some: { status: "PLAYING" } } } });
  });

  it("excludes pending rounds from score and distance queries and uses a composite cursor", async () => {
    mocks.roundAggregate.mockResolvedValue({ _avg: { score: 1000 }, _count: { _all: 1 } });
    mocks.roundFindMany.mockResolvedValue([dashboardRound]);
    await repository.aggregateCompletedRounds(range);
    await repository.findCompletedRoundsBatch(range, { gameId: "game-1", questionNumber: 1 });
    expect(mocks.roundAggregate).toHaveBeenCalledWith({ where: { game: { startedAt: dateFilter }, status: "COMPLETED" }, _avg: { score: true }, _count: { _all: true } });
    expect(mocks.roundFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { game: { startedAt: dateFilter }, status: "COMPLETED" },
      take: 500, skip: 1, cursor: { gameId_questionNumber: { gameId: "game-1", questionNumber: 1 } },
    }));
  });

  it("loads the first pending round only for incomplete games and applies a bounded cursor", async () => {
    mocks.gameFindMany.mockResolvedValue([]);
    await repository.findIncompleteGamesBatch(range, "last-game");
    expect(mocks.gameFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { startedAt: dateFilter, status: "INCOMPLETE" }, take: 500, skip: 1, cursor: { id: "last-game" },
      select: { id: true, rounds: { where: { status: "PENDING" }, orderBy: { questionNumber: "asc" }, take: 1, select: { questionNumber: true } } },
    }));
  });

  it("parameterizes both the daily SQL timezone and the exclusive date boundaries", async () => {
    mocks.daily.mockResolvedValue([{ date: "2026-10-27", count: 4 }]);
    expect(await repository.groupDailyGames(range)).toEqual([{ date: "2026-10-27", count: 4 }]);
    expect(mocks.daily.mock.calls[0][0].values).toEqual([DASHBOARD_TIME_ZONE, range.start, range.endExclusive]);
  });

  it("groups final scores only for completed games with valid totals up to 5000", async () => {
    mocks.gameGroupBy.mockResolvedValue([]);
    await repository.groupScores(range);
    expect(mocks.gameGroupBy).toHaveBeenCalledWith({
      by: ["totalScore"], where: { startedAt: dateFilter, status: "COMPLETED", totalScore: { gte: 0, lte: 5000 } }, _count: { _all: true },
    });
  });

  it("filters game ID or username, paginates stably and returns selected records without mapping them", async () => {
    mocks.gameCount.mockResolvedValue(11);
    mocks.gameFindMany.mockResolvedValue([dashboardGame]);
    const result = await repository.findGames(DashboardQuerySchema.parse({ search: " Player ", page: "2", pageSize: "5" }), range);
    expect(result).toEqual({ total: 11, items: [dashboardGame] });
    expect(mocks.gameFindMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 5, take: 5, orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      where: { startedAt: dateFilter, OR: [
        { id: { contains: "Player", mode: "insensitive" } }, { user: { name: { contains: "Player", mode: "insensitive" } } },
      ] },
      select: expect.objectContaining({ user: { select: { id: true, name: true } } }),
    }));
  });
});
