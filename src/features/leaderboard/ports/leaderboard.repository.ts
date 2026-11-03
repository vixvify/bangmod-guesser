import type { LeaderboardResult } from "@/features/leaderboard/domain/leaderboard";

export interface LeaderboardRepository {
  findLeaderboard(userId: string): Promise<LeaderboardResult>;
}
