import { AppError } from "@/core/errors/app.error";
import type { LeaderboardResult } from "@/core/domain/leaderboard";
import type { ProfileResult } from "@/core/domain/profile";
import type { LeaderboardRepository } from "@/core/ports/leaderboard.repository";
import type { ProfileQueryInput } from "@/core/schema/profile.schema";
import { LeaderboardFactory } from "@/infrastructure/factories/leaderboard.factory";

const PROFILE_PAGE_SIZE = 4;

export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
  ) {}

  async getLeaderboard(userId: string): Promise<LeaderboardResult> {
    const users =
      await this.leaderboardRepository.findLeaderboardUsers();

    const sortedUsers = users
      .map((user) => ({
        user,
        totalScore: user.games.reduce(
          (sum, game) => sum + (game.totalScore ?? 0),
          0,
        ),
        gamesPlayed: user.games.length,
      }))
      .sort((first, second) => {
        if (first.totalScore !== second.totalScore) {
          return second.totalScore - first.totalScore;
        }

        if (first.gamesPlayed !== second.gamesPlayed) {
          return first.gamesPlayed - second.gamesPlayed;
        }

        return first.user.name.localeCompare(second.user.name);
      });

    const rankedUsers = sortedUsers.map((item, index) => ({
      userId: item.user.id,
      entry: LeaderboardFactory.toEntry(item.user, index + 1),
    }));

    const myRank =
      rankedUsers.find((item) => item.userId === userId)?.entry ?? null;

    return LeaderboardFactory.toResult(
      rankedUsers.slice(0, 10).map((item) => item.entry),
      myRank,
    );
  }

  async getProfile(
    userId: string,
    options: ProfileQueryInput,
  ): Promise<ProfileResult> {
    const from = options.from
      ? new Date(`${options.from}T00:00:00.000Z`)
      : undefined;

    const to = options.to
      ? new Date(`${options.to}T00:00:00.000Z`)
      : undefined;

    const toExclusive = to
      ? new Date(
          Date.UTC(
            to.getUTCFullYear(),
            to.getUTCMonth(),
            to.getUTCDate() + 1,
          ),
        )
      : undefined;

    const result = await this.leaderboardRepository.findProfile(userId, {
      from,
      toExclusive,
      page: options.page,
      pageSize: PROFILE_PAGE_SIZE,
    });

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