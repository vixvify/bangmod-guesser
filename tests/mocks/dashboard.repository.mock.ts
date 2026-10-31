import { vi } from "vitest";
import type { DashboardRepository } from "@/core/ports/dashboard.repository";

export function createDashboardRepositoryMock() {
  return {
    groupGames: vi.fn<DashboardRepository["groupGames"]>(),
    countPlayers: vi.fn<DashboardRepository["countPlayers"]>(),
    countPlayingPlayers: vi.fn<DashboardRepository["countPlayingPlayers"]>(),
    aggregateCompletedRounds: vi.fn<DashboardRepository["aggregateCompletedRounds"]>(),
    findCompletedRoundsBatch: vi.fn<DashboardRepository["findCompletedRoundsBatch"]>(),
    findIncompleteGamesBatch: vi.fn<DashboardRepository["findIncompleteGamesBatch"]>(),
    groupDailyGames: vi.fn<DashboardRepository["groupDailyGames"]>(),
    groupScores: vi.fn<DashboardRepository["groupScores"]>(),
    findGames: vi.fn<DashboardRepository["findGames"]>(),
  } satisfies DashboardRepository;
}
