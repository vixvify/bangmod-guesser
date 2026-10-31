import type { DashboardDateRange } from "@/core/domain/dashboard";
import type { DashboardQueryInput } from "@/core/schema/dashboard.schema";
import type {
  DashboardDailyCount, DashboardDistanceRecord, DashboardGameRecords,
  DashboardIncompleteRecord, DashboardRoundAverage, DashboardRoundCursor,
  DashboardScoreCount, DashboardStatusCount,
} from "../../../prisma/types/dashboard";

export interface DashboardRepository {
  groupGames(range?: DashboardDateRange): Promise<DashboardStatusCount[]>;
  countPlayers(range: DashboardDateRange): Promise<number>;
  countPlayingPlayers(): Promise<number>;
  aggregateCompletedRounds(range: DashboardDateRange): Promise<DashboardRoundAverage>;
  findCompletedRoundsBatch(range: DashboardDateRange, cursor?: DashboardRoundCursor): Promise<DashboardDistanceRecord[]>;
  findIncompleteGamesBatch(range: DashboardDateRange, cursor?: string): Promise<DashboardIncompleteRecord[]>;
  groupDailyGames(range: DashboardDateRange): Promise<DashboardDailyCount[]>;
  groupScores(range: DashboardDateRange): Promise<DashboardScoreCount[]>;
  findGames(query: DashboardQueryInput, range: DashboardDateRange): Promise<DashboardGameRecords>;
}
