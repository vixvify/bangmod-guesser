import { AppError } from "@/shared/errors/app.error";
import type { LeaderboardResult } from "@/features/leaderboard/domain/leaderboard";
import type { ProfileResult } from "@/features/profile/domain/profile";
import type { LeaderboardRepository } from "@/features/leaderboard/ports/leaderboard.repository";
import type { ProfileQueryInput } from "@/features/profile/schema/profile.schema";
import { LeaderboardFactory } from "@/features/leaderboard/factories/leaderboard.factory";
import { shiftDateOnly, toBangkokStartOfDay } from "@/shared/lib/utils";

const PROFILE_PAGE_SIZE = 4;

export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
  ) {}

  async getLeaderboard(userId: string): Promise<LeaderboardResult> {
    const result =
      await this.leaderboardRepository.findLeaderboard(userId);

    return LeaderboardFactory.toResult(
      result.entries,
      result.myRank,
    );
  }

  async getProfile(
    userId: string,
    options: ProfileQueryInput,
  ): Promise<ProfileResult> {
    const from = options.from
      ? toBangkokStartOfDay(options.from)
      : undefined;

    const toExclusive = options.to
      ? toBangkokStartOfDay(shiftDateOnly(options.to, 1))
      : undefined;

    const result = await this.leaderboardRepository.findProfile(
      userId,
      {
        from,
        toExclusive,
        page: options.page,
        pageSize: PROFILE_PAGE_SIZE,
      },
    );

    if (!result.user) {
      throw new AppError("User not found", 404);
    }

    return LeaderboardFactory.toProfile(
      result.user,
      result.totalGames,
      options.page,
      PROFILE_PAGE_SIZE,
    );
  }
}
