import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";
import { dashboardGame, dashboardNow, dashboardRound } from "../../fixtures/dashboard";

const { requireAuth, repository } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  repository: {
    groupGames: vi.fn(), countPlayers: vi.fn(), countPlayingPlayers: vi.fn(),
    aggregateCompletedRounds: vi.fn(), findCompletedRoundsBatch: vi.fn(),
    findIncompleteGamesBatch: vi.fn(), groupDailyGames: vi.fn(), groupScores: vi.fn(), findGames: vi.fn(),
  },
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth-check", () => ({ requireAuth }));
vi.mock("@/infrastructure/container", async () => {
  const { DashboardService } = await import("@/core/service/dashboard.service");
  return { dashboardService: new DashboardService(repository) };
});
import { GET as summary } from "@/app/api/dashboard/route";
import { GET as games } from "@/app/api/dashboard/games/route";

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(dashboardNow);
  requireAuth.mockResolvedValue({ id: "admin", name: "Admin", email: "admin@example.test", role: UserRole.ADMIN });
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
afterEach(() => { vi.useRealTimers(); });

describe("dashboard request through the library, service and factory", () => {
  it("serializes the thirty-day default and empty metrics without calling a gameplay operation", async () => {
    const response = await summary(new Request("http://localhost/api/dashboard"));
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.period).toMatchObject({ startDate: "2026-09-28", endDate: "2026-10-27" });
    expect(data.players).toMatchObject({ date: "2026-10-27", count: 0, playing: 0 });
    expect(data.dailyGames).toHaveLength(30);
    expect(data.dropOff).toMatchObject({ baseline: { scope: "ALL_TIME", ratePercent: null }, comparison: "unavailable" });
    expect(data.scores).toMatchObject({ mean: null, median: null, highAccuracy: { percentage: null } });
    expect(data.games.items).toEqual([]);
  });

  it("keeps today's card current while historical analytics use a global drop-off baseline", async () => {
    repository.groupGames.mockResolvedValueOnce([
      { status: "COMPLETED", _count: { _all: 96 } }, { status: "INCOMPLETE", _count: { _all: 4 } },
    ]).mockResolvedValueOnce([{ status: "COMPLETED", _count: { _all: 50 } }])
      .mockResolvedValueOnce([{ status: "COMPLETED", _count: { _all: 940 } }, { status: "INCOMPLETE", _count: { _all: 60 } }]);
    repository.countPlayers.mockResolvedValueOnce(3).mockResolvedValueOnce(2);
    repository.countPlayingPlayers.mockResolvedValue(1);
    repository.aggregateCompletedRounds.mockResolvedValue({ _avg: { score: 800 }, _count: { _all: 1 } });
    repository.findCompletedRoundsBatch.mockResolvedValue([dashboardRound]);
    repository.groupScores.mockResolvedValue([{ totalScore: 5000, _count: { _all: 1 } }]);
    repository.findGames.mockResolvedValue({ total: 1, items: [dashboardGame] });
    const response = await summary(new Request("http://localhost/api/dashboard?startDate=2020-01-01&endDate=2020-01-02"));
    const { data } = await response.json();
    expect(data.period.startDate).toBe("2020-01-01");
    expect(data.players).toMatchObject({ date: "2026-10-27", count: 3, playing: 1 });
    expect(data.totalGames.changePercent).toBe(100);
    expect(data.roundAverage).toMatchObject({ score: 800, percentage: 80, distanceMeters: 0 });
    expect(data.dropOff).toMatchObject({ ratePercent: 4, baseline: { ratePercent: 6 }, comparison: "below", differencePercentagePoints: -2 });
    expect(data.scores.highAccuracy.percentage).toBe(100);
    expect(data.games.items[0]).toMatchObject({ user: { id: "user-1", name: "Player" }, bonusScore: null });
    expect(repository.groupGames).toHaveBeenNthCalledWith(3);
  });

  it("serves paginated logs through the service without querying overview statistics", async () => {
    repository.findGames.mockResolvedValue({ total: 11, items: [dashboardGame] });
    const response = await games(new Request("http://localhost/api/dashboard/games?search=Player&page=2&pageSize=5"));
    const { data } = await response.json();
    expect(response.status).toBe(200);
    expect(data).toMatchObject({ total: 11, page: 2, pageSize: 5, totalPages: 3 });
    expect(data.items[0].rounds[0].score).toBe(1000);
    expect(repository.groupGames).not.toHaveBeenCalled();
  });

  it.each(["/api/dashboard", "/api/dashboard/games"])("includes the game-detail UI fields in %s without inventing a bonus", async (path) => {
    repository.findGames.mockResolvedValue({
      total: 1,
      items: [{
        ...dashboardGame,
        rounds: [dashboardRound, {
          ...dashboardRound, questionNumber: 2, status: "PENDING",
          playTimeSeconds: null, guessedLatitude: null, guessedLongitude: null,
        }],
      }],
    });

    const handler = path === "/api/dashboard" ? summary : games;
    const response = await handler(new Request(`http://localhost${path}`));
    expect(response.status).toBe(200);
    const { data } = await response.json();
    const logs = path === "/api/dashboard" ? data.games : data;
    expect(logs.items[0]).toEqual({
      id: "game-1", user: { id: "user-1", name: "Player" }, status: "COMPLETED",
      startedAt: "2026-10-27T04:00:00.000Z", finishedAt: "2026-10-27T04:05:00.000Z",
      totalScore: 1300, roundScoreTotal: 1000, bonusScore: null,
      rounds: [
        {
          questionNumber: 1, status: "COMPLETED", location: { id: "location-1", name: "Library" },
          score: 1000, distanceMeters: 0, playTimeSeconds: 12,
        },
        {
          questionNumber: 2, status: "PENDING", location: { id: "location-1", name: "Library" },
          score: null, distanceMeters: null, playTimeSeconds: null,
        },
      ],
    });
  });
});
