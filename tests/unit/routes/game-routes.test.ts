import { describe, expect, it } from "vitest";
import { AppRoutes } from "@/routes/app/routes";

describe("game routes", () => {
  it("builds game-specific paths", () => {
    expect(AppRoutes.game("game-123")).toBe("/game/game-123");
    expect(AppRoutes.gameRoundScore("game-123")).toBe(
      "/game/game-123/round-score",
    );
    expect(AppRoutes.gameSummary("game-123")).toBe("/game/game-123/summary");
  });

  it("encodes game IDs as one path segment", () => {
    expect(AppRoutes.game("a/b")).toBe("/game/a%2Fb");
  });
});
