import { describe, expect, it } from "vitest";
import { DashboardFactory } from "@/infrastructure/factories/dashboard.factory";
import { dashboardGame, dashboardRound } from "../fixtures/dashboard";

describe("DashboardFactory", () => {
  it("maps all game statuses into total and incomplete counts", () => {
    expect(DashboardFactory.toGameCounts([
      { status: "COMPLETED", _count: { _all: 8 } }, { status: "INCOMPLETE", _count: { _all: 1 } },
      { status: "PLAYING", _count: { _all: 1 } },
    ])).toEqual({ total: 10, incomplete: 1 });
    expect(DashboardFactory.toGameCounts([])).toEqual({ total: 0, incomplete: 0 });
  });

  it("selects only public game and user fields and keeps pending round results unavailable", () => {
    const record = {
      ...dashboardGame, user: { ...dashboardGame.user, email: "private@example.test" },
      rounds: [dashboardRound, { ...dashboardRound, questionNumber: 2, status: "PENDING" as const }],
    };
    const result = DashboardFactory.toGame(record);
    expect(result.user).toEqual({ id: "user-1", name: "Player" });
    expect(result.startedAt).toBe("2026-10-27T04:00:00.000Z");
    expect(result.rounds[0]).toMatchObject({ score: 1000, distanceMeters: 0 });
    expect(result.rounds[1]).toMatchObject({ score: null, distanceMeters: null });
    expect(result.bonusScore).toBeNull();
  });
});
