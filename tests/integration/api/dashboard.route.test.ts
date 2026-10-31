import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/core/errors/app.error";
import { UserRole } from "@/core/domain/user";

const { requireAuth, summary, games } = vi.hoisted(() => ({ requireAuth: vi.fn(), summary: vi.fn(), games: vi.fn() }));
vi.mock("@/lib/auth-check", () => ({ requireAuth }));
vi.mock("@/lib/dashboard", () => ({ getDashboard: summary, getDashboardGames: games }));
import { GET as dashboard } from "@/app/api/dashboard/route";
import { GET as gameLogs } from "@/app/api/dashboard/games/route";

beforeEach(() => {
  vi.resetAllMocks();
  requireAuth.mockResolvedValue({ id: "admin", name: "Admin", email: "admin@example.test", role: UserRole.ADMIN });
  summary.mockResolvedValue({ totalGames: { count: 0 } });
  games.mockResolvedValue({ items: [], total: 0 });
});

describe.each([
  { path: "/api/dashboard", handler: dashboard, operation: summary },
  { path: "/api/dashboard/games", handler: gameLogs, operation: games },
])("GET $path", ({ path, handler, operation }) => {
  it("returns the shared response and prevents caching private analytics", async () => {
    const response = await handler(new Request(`http://localhost${path}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({ status: 200, statusCode: "SUCCESS" });
    expect(operation).toHaveBeenCalledWith({ search: "", page: 1, pageSize: 10 });
  });

  it("passes parsed date, search and pagination values to the dashboard library", async () => {
    await handler(new Request(`http://localhost${path}?startDate=2026-10-01&endDate=2026-10-27&search=Player&page=2&pageSize=20`));
    expect(operation).toHaveBeenCalledWith({ startDate: "2026-10-01", endDate: "2026-10-27", search: "Player", page: 2, pageSize: 20 });
  });

  it("rejects unauthenticated requests before accessing analytics", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));
    expect((await handler(new Request(`http://localhost${path}`))).status).toBe(401);
    expect(operation).not.toHaveBeenCalled();
  });

  it("rejects non-admin users using the actual role check", async () => {
    requireAuth.mockResolvedValue({ id: "player", role: UserRole.USER });
    expect((await handler(new Request(`http://localhost${path}`))).status).toBe(403);
    expect(operation).not.toHaveBeenCalled();
  });

  it.each(["startDate=2026-10-01", "page=0", "pageSize=101", "startDate=2026-10-27&endDate=2026-10-01"])("rejects invalid query %s without querying data", async (query) => {
    expect((await handler(new Request(`http://localhost${path}?${query}`))).status).toBe(400);
    expect(operation).not.toHaveBeenCalled();
  });

  it("hides internal database errors", async () => {
    operation.mockRejectedValue(new Error("database credentials and stack trace"));
    const response = await handler(new Request(`http://localhost${path}`));
    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe("Internal server error");
  });
});
