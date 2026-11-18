import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserProfilePage from "@/app/profile/[userId]/page";
import { UserRole } from "@/features/users/user";
import { profileService, leaderboardService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { notFound } from "next/navigation";
import { AppError } from "@/shared/errors/app.error";

vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth: vi.fn() }));
vi.mock("@/container", () => ({
  profileService: { getProfile: vi.fn() },
  leaderboardService: { getLeaderboard: vi.fn() },
}));
vi.mock("@/shared/lib/http", () => ({ default: { get: vi.fn() } }));
vi.mock("@/features/profile/profile.routes", () => ({ ProfileRoutes: { history: "/api/profile" } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/profile/other_user",
  notFound: vi.fn(),
}));
vi.mock("@/features/auth/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

describe("UserProfilePage", () => {
  const searchParams = Promise.resolve({});

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      image: "https://example.com/student.jpg",
      role: UserRole.ADMIN,
    });
    vi.mocked(profileService.getProfile).mockResolvedValue({
      id: "other_user",
      name: "Other Player",
      email: null,
      image: "https://example.com/other.jpg",
      isOwner: false,
      games: [{ id: "game-1", status: "COMPLETED", totalScore: 3000, grade: "A", playedAt: "2026-10-20T10:00:00.000Z" }],
      pagination: { page: 1, pageSize: 4, totalGames: 1, totalPages: 1 },
    });
    vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({ entries: [], myRank: { userId: "other_user", rank: 4, name: "Other Player", image: null, gamesPlayed: 12, totalScore: 15000 } });
  });

  it("renders another user's public profile and hides email and management actions", async () => {
    const markup = renderToStaticMarkup(
      await UserProfilePage({
        params: Promise.resolve({ userId: "other_user" }),
        searchParams,
      }),
    );

    expect(requireAuth).toHaveBeenCalledOnce();
    expect(profileService.getProfile).toHaveBeenCalledWith(
      "other_user",
      { page: 1 },
      "user_1",
    );
    expect(markup).toContain("Other Player");
    expect(markup).toContain("https://example.com/other.jpg");
    expect(markup).not.toContain("other@example.com");
    expect(markup).not.toContain("student@example.com");
    expect(markup).not.toContain("แก้ไขชื่อผู้ใช้");
    expect(markup).not.toContain("จัดการระบบ");
    expect(markup).toContain("ประวัติการเล่นเกม");
    expect(markup).toContain("#4");
    expect(markup).toContain("15,000");
    expect(markup).toContain("เกมที่เล่นจบ");
  });

  it("calls notFound when the user does not exist", async () => {
    vi.mocked(profileService.getProfile).mockRejectedValue(
      new AppError("User not found", 404),
    );

    await UserProfilePage({
      params: Promise.resolve({ userId: "missing_user" }),
      searchParams,
    });

    expect(notFound).toHaveBeenCalledOnce();
  });

  it("shows an empty rank and zero totals when the player has not completed a game", async () => {
    vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({ entries: [], myRank: null });
    const markup = renderToStaticMarkup(await UserProfilePage({ params: Promise.resolve({ userId: "other_user" }), searchParams }));
    expect(markup).toContain("ยังไม่มีอันดับ");
    expect(markup).toContain("เกมที่เล่นจบ");
  });

  it("shows stats when opening your own profile through its user URL", async () => {
    const markup = renderToStaticMarkup(await UserProfilePage({ params: Promise.resolve({ userId: "user_1" }), searchParams }));
    expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith("user_1");
    expect(markup).toContain("15,000");
    expect(markup).toContain("แก้ไขชื่อผู้ใช้");
  });
});
