import type { LeaderboardResult } from "@/features/leaderboard/leaderboard";
import type { LeaderboardRepository } from "@/features/leaderboard/server/leaderboard.repository.port";

export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
  ) {}

  async getLeaderboard(userId: string): Promise<LeaderboardResult> {
    return this.leaderboardRepository.findLeaderboard(userId);
  }
}
