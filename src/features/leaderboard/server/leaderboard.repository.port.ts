import type { LeaderboardResult } from "@/features/leaderboard/leaderboard";

export interface LeaderboardRepository {
  findLeaderboard(userId: string): Promise<LeaderboardResult>;
}
