import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";

const { requireAuth, getProfile, getLeaderboard } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getProfile: vi.fn(),
  getLeaderboard: vi.fn(),
}));

vi.mock("@/features/auth/lib/auth-check", () => ({ requireAuth }));
vi.mock("@/container", () => ({
  leaderboardService: { getProfile, getLeaderboard },
}));

import { GET as profile } from "@/app/api/profile/route";
import { GET as leaderboard } from "@/app/api/leaderboard/route";

beforeEach(() => {
  vi.resetAllMocks();
  requireAuth.mockResolvedValue({ id: "player-1" });
  getProfile.mockResolvedValue({ games: [], pagination: { page: 1, totalGames: 0 } });
  getLeaderboard.mockResolvedValue({ entries: [], myRank: null });
});

describe("profile and leaderboard API routes", () => {
  it("reads only the authenticated player's history with validated dates and page", async () => {
    const response = await profile(new Request("http://localhost/api/profile?from=2026-10-01&to=2026-10-31&page=2"));

    expect(response.status).toBe(200);
    expect(getProfile).toHaveBeenCalledWith("player-1", { from: "2026-10-01", to: "2026-10-31", page: 2 });
    expect((await response.json()).data.games).toEqual([]);
  });

  it.each(["from=2026-02-30", "from=2026-10-31&to=2026-10-01", "page=0"])(
    "rejects invalid profile query %s before querying data",
    async (query) => {
      expect((await profile(new Request(`http://localhost/api/profile?${query}`))).status).toBe(400);
      expect(getProfile).not.toHaveBeenCalled();
    },
  );

  it("returns leaderboard entries and the current player's rank", async () => {
    const response = await leaderboard();

    expect(response.status).toBe(200);
    expect(getLeaderboard).toHaveBeenCalledWith("player-1");
    expect((await response.json()).data).toEqual({ entries: [], myRank: null });
  });

  it("rejects unauthenticated requests for both endpoints", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));

    expect((await profile(new Request("http://localhost/api/profile"))).status).toBe(401);
    expect((await leaderboard()).status).toBe(401);
    expect(getProfile).not.toHaveBeenCalled();
    expect(getLeaderboard).not.toHaveBeenCalled();
  });
});
