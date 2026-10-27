import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardQuerySchema } from "@/core/schema/dashboard.schema";
import { dashboardNow } from "../../fixtures/dashboard";

const { overview, games } = vi.hoisted(() => ({ overview: vi.fn(), games: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/infrastructure/container", () => ({ dashboardService: { getOverview: overview, getGames: games } }));
import { getDashboard, getDashboardGames } from "@/lib/dashboard";

beforeEach(() => {
  vi.resetAllMocks();
  overview.mockResolvedValue({ totalGames: { count: 4 }, generatedAt: dashboardNow.toISOString() });
  games.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 });
});

describe("dashboard library", () => {
  it("combines service results into one response using the same request reference time", async () => {
    const query = DashboardQuerySchema.parse({});
    const result = await getDashboard(query, dashboardNow);
    expect(result).toEqual({
      totalGames: { count: 4 }, generatedAt: dashboardNow.toISOString(),
      games: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 },
    });
    expect(overview).toHaveBeenCalledWith(query, dashboardNow);
    expect(games).toHaveBeenCalledWith(query, dashboardNow);
  });

  it("fetches logs without fetching or recalculating the dashboard overview", async () => {
    const query = DashboardQuerySchema.parse({ search: "Player" });
    expect(await getDashboardGames(query, dashboardNow)).toMatchObject({ items: [], total: 0 });
    expect(overview).not.toHaveBeenCalled();
    expect(games).toHaveBeenCalledWith(query, dashboardNow);
  });

  it("propagates a failed read instead of presenting a partial response as complete analytics", async () => {
    overview.mockRejectedValue(new Error("Read failed"));
    await expect(getDashboard(DashboardQuerySchema.parse({}), dashboardNow)).rejects.toThrow("Read failed");
  });
});
