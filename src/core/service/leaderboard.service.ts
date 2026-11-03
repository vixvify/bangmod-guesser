import { AppError } from "@/core/errors/app.error";
import type { LeaderboardResult } from "@/core/domain/leaderboard";
import type { ProfileResult } from "@/core/domain/profile";
import type { LeaderboardRepository } from "@/core/ports/leaderboard.repository";
import type { ProfileQueryInput } from "@/core/schema/profile.schema";
import { LeaderboardFactory } from "@/infrastructure/factories/leaderboard.factory";

const PROFILE_PAGE_SIZE = 4;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const BANGKOK_UTC_OFFSET = "+07:00";

function toBangkokStartOfDay(date: string): Date {
  return new Date(`${date}T00:00:00.000${BANGKOK_UTC_OFFSET}`);
}

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
      ? toBangkokStartOfDay(options.from)
      : undefined;

    const toExclusive = options.to
      ? new Date(
          toBangkokStartOfDay(options.to).getTime() +
            MILLISECONDS_PER_DAY,
        )
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