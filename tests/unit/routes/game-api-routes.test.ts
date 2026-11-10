import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/config/runtime", () => ({ config: { apiUrl: "http://localhost/api" } }));
import { GameRoutes } from "@/features/game/game.routes";

describe("GameRoutes", () => {
  it("builds the exit endpoint and encodes the ID as one path segment", () => {
    expect(GameRoutes.exit("game-1")).toBe("http://localhost/api/games/game-1/exit");
    expect(GameRoutes.exit("game/1?other=true")).toBe("http://localhost/api/games/game%2F1%3Fother%3Dtrue/exit");
  });
  it("builds the recorded-round result endpoint without allowing the ID to change paths", () => {
    expect(GameRoutes.roundResult("game/1?other=true", 3)).toBe("http://localhost/api/games/game%2F1%3Fother%3Dtrue/rounds/3/result");
  });

});
