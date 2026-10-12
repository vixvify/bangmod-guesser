import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/leaderboard",
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("@/lib/auth-check", () => ({ requireAuth: vi.fn() }));

import LeaderboardPage from "@/app/leaderboard/page";
import { requireAuth } from "@/lib/auth-check";

describe("LeaderboardPage", () => {
  it("shows ten mock ranks and keeps the signed-in player's rank visible at the bottom", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: UserRole.USER,
    });

    const markup = renderToStaticMarkup(await LeaderboardPage());

    expect(requireAuth).toHaveBeenCalledOnce();
    expect(markup).toContain("อันดับผู้เล่น");
    expect(markup.match(/data-leaderboard-rank="\d+"/g)).toHaveLength(10);
    expect(markup).toContain("phobrak");
    expect(markup).toContain("244,553");
    expect(markup).toContain("KMUTT Student");
    expect(markup).toContain('data-leaderboard-current="true"');
    expect(markup).toContain("sticky bottom-4");
    expect(markup).toContain("border-l-primary-main/40");
    expect(markup).toContain("bg-leaderboard-self");
    expect(markup).not.toContain("bg-primary-main/12");
    expect(markup).toContain('href="/leaderboard"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("bg-secondary-main text-surface-text");
  });
});
