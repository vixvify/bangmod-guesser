import type { LeaderboardResult } from "@/features/leaderboard/domain/leaderboard";
import type { LeaderboardRepository } from "@/features/leaderboard/ports/leaderboard.repository";

export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
  ) {}

  async getLeaderboard(userId: string): Promise<LeaderboardResult> {
    return this.leaderboardRepository.findLeaderboard(userId);
  }
}
