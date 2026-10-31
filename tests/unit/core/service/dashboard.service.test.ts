import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardService } from "@/core/service/dashboard.service";
import { DashboardQuerySchema } from "@/core/schema/dashboard.schema";
import { dashboardGame, dashboardNow, dashboardRound } from "../../../fixtures/dashboard";
import { createDashboardRepositoryMock } from "../../../mocks/dashboard.repository.mock";

const repository = createDashboardRepositoryMock();
const service = new DashboardService(repository);

beforeEach(() => {
  vi.resetAllMocks();
  repository.groupGames.mockResolvedValue([]);
  repository.countPlayers.mockResolvedValue(0);
  repository.countPlayingPlayers.mockResolvedValue(0);
  repository.aggregateCompletedRounds.mockResolvedValue({ _avg: { score: null }, _count: { _all: 0 } });
  repository.findCompletedRoundsBatch.mockResolvedValue([]);
  repository.findIncompleteGamesBatch.mockResolvedValue([]);
  repository.groupDailyGames.mockResolvedValue([]);
  repository.groupScores.mockResolvedValue([]);
  repository.findGames.mockResolvedValue({ total: 0, items: [] });
});

describe("DashboardService.getOverview", () => {
  it("returns thirty zero-filled days and explicit unavailable metrics when no games exist", async () => {
    const result = await service.getOverview(DashboardQuerySchema.parse({}), dashboardNow);
    expect(result.period).toMatchObject({ startDate: "2026-09-28", endDate: "2026-10-27" });
    expect(result.totalGames).toEqual({ count: 0, previousCount: 0, changePercent: null });
    expect(result.players).toEqual({
      date: "2026-10-27", previousDate: "2026-10-26", timeZone: "Asia/Bangkok",
      count: 0, previousCount: 0, changePercent: null, playing: 0,
    });
    expect(result.roundAverage).toMatchObject({ score: null, distanceMeters: null, count: 0, distanceCount: 0 });
    expect(result.dropOff).toMatchObject({ count: 0, ratePercent: 0, comparison: "unavailable", baseline: { scope: "ALL_TIME", ratePercent: null } });
    expect(result.dailyGames).toHaveLength(30);
    expect(result.dailyGames.every((day) => day.count === 0)).toBe(true);
    expect(result.scores.median).toBeNull();
  });

  it("compares filtered game counts with the preceding period and drop-off with every game in the system", async () => {
    repository.groupGames.mockResolvedValueOnce([
      { status: "COMPLETED", _count: { _all: 96 } }, { status: "INCOMPLETE", _count: { _all: 4 } },
    ]).mockResolvedValueOnce([{ status: "COMPLETED", _count: { _all: 50 } }])
      .mockResolvedValueOnce([
        { status: "COMPLETED", _count: { _all: 900 } }, { status: "INCOMPLETE", _count: { _all: 60 } },
        { status: "PLAYING", _count: { _all: 40 } },
      ]);
    repository.countPlayers.mockResolvedValueOnce(3).mockResolvedValueOnce(2);
    repository.countPlayingPlayers.mockResolvedValue(1);
    repository.aggregateCompletedRounds.mockResolvedValue({ _avg: { score: 850 }, _count: { _all: 2 } });
    repository.findCompletedRoundsBatch.mockResolvedValue([dashboardRound, { ...dashboardRound, guessedLatitude: null }]);
    repository.findIncompleteGamesBatch.mockResolvedValue([
      { id: "abandoned-1", rounds: [{ questionNumber: 2 }] }, { id: "abandoned-2", rounds: [] },
    ]);
    repository.groupDailyGames.mockResolvedValue([{ date: "2026-10-27", count: 4 }]);
    repository.groupScores.mockResolvedValue([{ totalScore: 5000, _count: { _all: 1 } }]);
    const result = await service.getOverview(DashboardQuerySchema.parse({}), dashboardNow);
    expect(result.totalGames).toEqual({ count: 100, previousCount: 50, changePercent: 100 });
    expect(result.players).toMatchObject({ count: 3, previousCount: 2, playing: 1, changePercent: 50 });
    expect(result.roundAverage).toEqual({ score: 850, maxScore: 1000, percentage: 85, count: 2, distanceMeters: 0, distanceCount: 1 });
    expect(result.dropOff).toMatchObject({
      count: 4, ratePercent: 4, comparison: "below", differencePercentagePoints: -2,
      baseline: { scope: "ALL_TIME", gameCount: 1000, incompleteCount: 60, ratePercent: 6 },
      mostCommonRound: 2, unknownRoundCount: 1,
    });
    expect(repository.groupGames).toHaveBeenNthCalledWith(3);
    expect(result.dailyGames.at(-1)).toEqual({ date: "2026-10-27", count: 4 });
    expect(result.dailyGames[0].count).toBe(0);
    expect(result.scores).toMatchObject({ median: 5000, mean: 5000, highAccuracy: { percentage: 100 } });
  });

  it("keeps today's players and yesterday's comparison independent of an old selected range", async () => {
    const query = DashboardQuerySchema.parse({ startDate: "2020-01-01", endDate: "2020-01-02" });
    const result = await service.getOverview(query, dashboardNow);
    expect(result.period.startDate).toBe("2020-01-01");
    expect(result.players.date).toBe("2026-10-27");
    expect(repository.countPlayers).toHaveBeenNthCalledWith(1, expect.objectContaining({
      start: new Date("2026-10-26T17:00:00Z"), endExclusive: new Date("2026-10-27T17:00:00Z"),
    }));
    expect(repository.countPlayers).toHaveBeenNthCalledWith(2, {
      start: new Date("2026-10-25T17:00:00Z"), endExclusive: new Date("2026-10-26T17:00:00Z"),
    });
    expect(repository.countPlayingPlayers).toHaveBeenCalledWith();
  });

  it("continues distance batches with a unique cursor instead of truncating large histories", async () => {
    const batch = Array.from({ length: 500 }, (_, index) => ({ ...dashboardRound, gameId: `game-${index}` }));
    repository.findCompletedRoundsBatch.mockResolvedValueOnce(batch).mockResolvedValueOnce([dashboardRound]);
    const result = await service.getOverview(DashboardQuerySchema.parse({}), dashboardNow);
    expect(result.roundAverage.distanceCount).toBe(501);
    expect(repository.findCompletedRoundsBatch).toHaveBeenNthCalledWith(2, expect.any(Object), { gameId: "game-499", questionNumber: 1 });
  });

  it("continues incomplete-game batches and preserves unknown drop-off rounds", async () => {
    repository.findIncompleteGamesBatch.mockResolvedValueOnce(Array.from({ length: 500 }, (_, index) => ({ id: `game-${index}`, rounds: [] })))
      .mockResolvedValueOnce([{ id: "last", rounds: [{ questionNumber: 3 }] }]);
    const result = await service.getOverview(DashboardQuerySchema.parse({}), dashboardNow);
    expect(result.dropOff).toMatchObject({ unknownRoundCount: 500, mostCommonRound: 3 });
    expect(repository.findIncompleteGamesBatch).toHaveBeenNthCalledWith(2, expect.any(Object), "game-499");
  });
});

describe("DashboardService.getGames", () => {
  it("returns saved totals, round details and shared pagination without adding gameplay bonuses", async () => {
    repository.findGames.mockResolvedValue({ total: 11, items: [{ ...dashboardGame, rounds: [dashboardRound, {
      ...dashboardRound, questionNumber: 2, status: "PENDING", score: 999,
    }] }] });
    const query = DashboardQuerySchema.parse({ search: " Player ", page: "2", pageSize: "5" });
    const result = await service.getGames(query, dashboardNow);
    expect(result).toMatchObject({ total: 11, page: 2, pageSize: 5, totalPages: 3 });
    expect(result.items[0]).toMatchObject({ totalScore: 1300, roundScoreTotal: 1000, bonusScore: null });
    expect(result.items[0].rounds[1]).toMatchObject({ score: null, distanceMeters: null });
    expect(repository.findGames).toHaveBeenCalledWith(query, expect.objectContaining({
      start: new Date("2026-09-27T17:00:00Z"), endExclusive: new Date("2026-10-27T17:00:00Z"),
    }));
  });

  it("preserves missing scores and finish times", async () => {
    repository.findGames.mockResolvedValue({ total: 1, items: [{ ...dashboardGame, totalScore: null, finishedAt: null, rounds: [] }] });
    const result = await service.getGames(DashboardQuerySchema.parse({}), dashboardNow);
    expect(result.items[0]).toMatchObject({ totalScore: null, finishedAt: null, bonusScore: null });
  });
});
