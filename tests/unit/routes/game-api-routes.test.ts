import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({ config: { apiUrl: "http://localhost/api" } }));
import { GameRoutes } from "@/routes/api/game.routes";

describe("GameRoutes", () => {
  it("builds the exit endpoint and encodes the ID as one path segment", () => {
    expect(GameRoutes.exit("game-1")).toBe("http://localhost/api/games/game-1/exit");
    expect(GameRoutes.exit("game/1?other=true")).toBe("http://localhost/api/games/game%2F1%3Fother%3Dtrue/exit");
  });
});
