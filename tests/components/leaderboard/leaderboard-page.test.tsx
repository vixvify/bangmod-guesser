import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/domain/user";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/leaderboard",
}));

vi.mock("@/features/auth/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("@/features/auth/lib/auth-check", () => ({ requireAuth: vi.fn() }));
vi.mock("@/container", () => ({
  leaderboardService: { getLeaderboard: vi.fn() },
}));

import LeaderboardPage from "@/app/leaderboard/page";
import { leaderboardService } from "@/container";
import { requireAuth } from "@/features/auth/lib/auth-check";

describe("LeaderboardPage", () => {
  it("shows ten persisted ranks and the signed-in player's actual rank at the bottom", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: UserRole.USER,
    });
    vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({
      entries: Array.from({ length: 10 }, (_, index) => ({
        rank: index + 1,
        name: `Player ${index + 1}`,
        gamesPlayed: 10 - index,
        totalScore: 10000 - index * 100,
      })),
      myRank: { rank: 12, name: "KMUTT Student", gamesPlayed: 3, totalScore: 2500 },
    });

    const markup = renderToStaticMarkup(await LeaderboardPage());

    expect(requireAuth).toHaveBeenCalledOnce();
    expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith("user_1");
    expect(markup).toContain("อันดับผู้เล่น");
    expect(markup.match(/data-leaderboard-rank="\d+"/g)).toHaveLength(10);
    expect(markup).toContain("Player 1");
    expect(markup).toContain("10,000");
    expect(markup).toContain("KMUTT Student");
    expect(markup).toContain("2,500");
    expect(markup).toContain('data-leaderboard-current="true"');
    expect(markup).toContain("sticky bottom-4");
    expect(markup).toContain("border-l-primary-main/40");
    expect(markup).toContain("bg-leaderboard-self");
    expect(markup).not.toContain("bg-primary-main/12");
    expect(markup).toContain('href="/leaderboard"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("bg-secondary-main text-surface-text");
  });

  it("shows an empty leaderboard and no invented rank before anyone completes a game", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "user_2", name: "New Player", email: "new@example.com", role: UserRole.USER });
    vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({ entries: [], myRank: null });

    const markup = renderToStaticMarkup(await LeaderboardPage());

    expect(markup).toContain("ยังไม่มีผู้เล่นในอันดับ");
    expect(markup).toContain("New Player ยังไม่มีอันดับ");
    expect(markup).not.toContain('data-leaderboard-rank="1"');
    expect(markup).not.toContain('data-leaderboard-current="true"');
  });
});
