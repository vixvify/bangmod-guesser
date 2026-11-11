import { describe, expect, it } from "vitest";
import { DashboardFactory } from "@/features/dashboard/server/dashboard.factory";
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

  it("calculates the completed game's bonus from total round time", () => {
    const rounds = Array.from({ length: 5 }, (_, index) => ({
      ...dashboardRound, questionNumber: index + 1, playTimeSeconds: 12,
    }));
    expect(DashboardFactory.toGame({ ...dashboardGame, rounds }).bonusScore).toBe(221);
    expect(DashboardFactory.toGame({ ...dashboardGame, rounds: rounds.map((round, index) =>
      index === 0 ? { ...round, playTimeSeconds: null } : round,
    ) }).bonusScore).toBeNull();
    expect(DashboardFactory.toGame({ ...dashboardGame, status: "INCOMPLETE", rounds }).bonusScore).toBeNull();
  });
});
