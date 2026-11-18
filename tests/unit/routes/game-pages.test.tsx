import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authCheck, requireAuth } from "@/features/auth/server/auth-check";

const { redirect, exitActiveGame } = vi.hoisted(() => ({
  redirect: vi.fn(),
  exitActiveGame: vi.fn(),
}));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    redirect,
  };
});
vi.mock("@/container", () => ({ gameService: { exitActiveGame } }));
vi.mock("@/features/auth/server/auth-check", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "player" }),
  authCheck: vi.fn().mockResolvedValue({ id: "player" }),
}));

vi.mock("@/features/game/components/game-session", () => ({
  GameSession: () => <div data-testid="game-session" />,
}));
vi.mock("@/features/game/components/game-round-score-screen", () => ({
  GameRoundScoreScreen: ({ gameId }: { gameId: string }) => <main data-game-id={gameId}>round score</main>,
}));
vi.mock("@/features/game/components/game-summary-screen", () => ({
  GameSummaryScreen: ({ gameId }: { gameId: string }) => <main data-game-id={gameId}>summary</main>,
}));

import GamePage from "@/app/game/[gameId]/page";
import RoundScorePage from "@/app/game/[gameId]/round-score/page";
import GameSummaryPage from "@/app/game/[gameId]/summary/page";
import GameRootPage from "@/app/game/page";
import { AppRoutes } from "@/shared/routes/routes";
import { UserRole } from "@/features/users/user";

describe("game pages", () => {
  it.each([GamePage, RoundScorePage, GameSummaryPage])("rejects direct rendering without an authenticated user", async (Page) => {
    vi.mocked(requireAuth).mockRejectedValueOnce(new Error("Unauthorized"));
    await expect(Page({ params: Promise.resolve({ gameId: "demo" }), searchParams: Promise.resolve({ round: "2" }) })).rejects.toThrow("Unauthorized");
  });
  it("uses the route game ID as the session key", async () => {
    const session = await GamePage({ params: Promise.resolve({ gameId: "game-123" }) });
    expect(session.key).toBe("game-123");
    expect(renderToStaticMarkup(session)).toContain('data-testid="game-session"');
  });

  it("composes the score and summary screens with the route game ID", async () => {
    const score = renderToStaticMarkup(
      await RoundScorePage({
        params: Promise.resolve({ gameId: "game-123" }),
        searchParams: Promise.resolve({ round: "2" }),
      }),
    );
    const summary = renderToStaticMarkup(
      await GameSummaryPage({ params: Promise.resolve({ gameId: "game-123" }) }),
    );

    expect(score).toBe('<main data-game-id="game-123">round score</main>');
    expect(summary).toBe('<main data-game-id="game-123">summary</main>');
  });

  it("exits active game and redirects to home on /game", async () => {
    vi.mocked(authCheck).mockResolvedValueOnce({ id: "player-1", name: "Player", email: "p@example.com", image: null, role: UserRole.USER });
    await GameRootPage();

    expect(exitActiveGame).toHaveBeenCalledWith("player-1");
    expect(redirect).toHaveBeenCalledWith(AppRoutes.home);
  });

  it("redirects unauthenticated user to home on /game without throwing", async () => {
    vi.mocked(authCheck).mockResolvedValueOnce(null);
    await GameRootPage();

    expect(redirect).toHaveBeenCalledWith(AppRoutes.home);
  });
});
