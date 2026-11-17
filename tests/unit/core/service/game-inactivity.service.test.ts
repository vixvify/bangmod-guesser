import { describe, expect, it } from "vitest";
import { GameService } from "@/features/game/server/game.service";
import { createGameRepositoryMock } from "../../../mocks/game.repository.mock";

describe("GameService.expireInactiveGames", () => {
  it("uses a four-hour cutoff and records the job time", async () => {
    const repository = createGameRepositoryMock();
    repository.expireInactiveGames.mockResolvedValue(2);
    const now = new Date("2026-11-17T12:00:00Z");
    expect(await new GameService(repository).expireInactiveGames(now)).toBe(2);
    expect(repository.expireInactiveGames).toHaveBeenCalledWith(new Date("2026-11-17T08:00:00Z"), now);
  });
});
