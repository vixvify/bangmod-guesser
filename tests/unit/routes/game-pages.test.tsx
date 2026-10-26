import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { requireAuth } from "@/lib/auth-check";

vi.mock("@/lib/auth-check", () => ({ requireAuth: vi.fn().mockResolvedValue({ id: "player" }) }));

vi.mock("@/components/game/game-session", () => ({
  GameSession: () => <div data-testid="game-session" />,
}));
vi.mock("@/components/game/game-round-score", () => ({
  GameRoundScore: ({ gameId }: { gameId: string }) => <main data-game-id={gameId}>round score</main>,
}));
vi.mock("@/components/game/game-summary", () => ({
  GameSummary: ({ gameId }: { gameId: string }) => <main data-game-id={gameId}>summary</main>,
}));

import GamePage from "@/app/game/[gameId]/page";
import RoundScorePage from "@/app/game/[gameId]/round-score/page";
import GameSummaryPage from "@/app/game/[gameId]/summary/page";

describe("game pages", () => {
  it.each([GamePage, RoundScorePage, GameSummaryPage])("rejects direct rendering without an authenticated user", async (Page) => {
    vi.mocked(requireAuth).mockRejectedValueOnce(new Error("Unauthorized"));
    await expect(Page({ params: Promise.resolve({ gameId: "demo" }) })).rejects.toThrow("Unauthorized");
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
      }),
    );
    const summary = renderToStaticMarkup(
      await GameSummaryPage({ params: Promise.resolve({ gameId: "game-123" }) }),
    );

    expect(score).toBe('<main data-game-id="game-123">round score</main>');
    expect(summary).toBe('<main data-game-id="game-123">summary</main>');
  });
});
