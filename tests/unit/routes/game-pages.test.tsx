import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/components/game/game-session", () => ({
  GameSession: () => <div data-testid="game-session" />,
}));

import GamePage from "@/app/game/[gameId]/page";
import RoundScorePage from "@/app/game/[gameId]/round-score/page";
import GameSummaryPage from "@/app/game/[gameId]/summary/page";

describe("game pages", () => {
  it("uses the route game ID as the session key", async () => {
    const session = await GamePage({ params: Promise.resolve({ gameId: "game-123" }) });
    expect(session.key).toBe("game-123");
    expect(renderToStaticMarkup(session)).toContain('data-testid="game-session"');
  });

  it("keeps score and summary pages blank while retaining their parameters", async () => {
    const score = renderToStaticMarkup(
      await RoundScorePage({
        params: Promise.resolve({ gameId: "game-123" }),
      }),
    );
    const summary = renderToStaticMarkup(
      await GameSummaryPage({ params: Promise.resolve({ gameId: "game-123" }) }),
    );

    expect(score).toBe('<main data-game-id="game-123"></main>');
    expect(summary).toBe('<main data-game-id="game-123"></main>');
  });
});
