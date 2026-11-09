import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";

const { requireAuth, getProfile, getLeaderboard, updateUsername } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getProfile: vi.fn(),
  getLeaderboard: vi.fn(),
  updateUsername: vi.fn(),
}));

vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth }));
vi.mock("@/container", () => ({
  profileService: { getProfile },
  authService: { updateUsername },
  leaderboardService: { getLeaderboard },
}));

import { GET as profile, PATCH as updateProfile } from "@/app/api/profile/route";
import { GET as leaderboard } from "@/app/api/leaderboard/route";

beforeEach(() => {
  vi.resetAllMocks();
  requireAuth.mockResolvedValue({ id: "player-1" });
  getProfile.mockResolvedValue({ games: [], pagination: { page: 1, totalGames: 0 } });
  getLeaderboard.mockResolvedValue({ entries: [], myRank: null });
  updateUsername.mockResolvedValue(new Headers({ "set-cookie": "session=updated; HttpOnly" }));
});

describe("profile and leaderboard API routes", () => {
  it("updates the authenticated user's trimmed name and forwards session cookies", async () => {
    const response = await updateProfile(new Request("http://localhost/api/profile", {
      method: "PATCH", headers: { "content-type": "application/json", cookie: "session=old" },
      body: JSON.stringify({ username: "  New name  " }),
    }));
    expect(response.status).toBe(200);
    expect(updateUsername).toHaveBeenCalledWith(expect.any(Headers), { username: "New name" });
    expect(updateUsername.mock.calls[0][0].get("cookie")).toBe("session=old");
    expect(response.headers.get("set-cookie")).toContain("session=updated");
    expect((await response.json()).data).toEqual({ username: "New name" });
  });

  it("rejects invalid usernames and unauthenticated updates", async () => {
    const request = () => new Request("http://localhost/api/profile", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: " " }),
    });
    expect((await updateProfile(request())).status).toBe(400);
    expect(updateUsername).not.toHaveBeenCalled();
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));
    expect((await updateProfile(request())).status).toBe(401);
    expect(updateUsername).not.toHaveBeenCalled();
  });
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
