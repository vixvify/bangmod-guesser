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
    const page = options.page ?? 1;

    if (!Number.isInteger(page) || page < 1) {
      throw new AppError("Page must be a positive integer", 400);
    }

    const from = this.parseDate(options.from, "from");
    const to = this.parseDate(options.to, "to");

    if (from && to && from.getTime() > to.getTime()) {
      throw new AppError("From date must not be after to date", 400);
    }

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
      page,
      PROFILE_PAGE_SIZE,
    );
  }

  private parseDate(
    value: string | undefined,
    field: string,
  ): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new AppError(`${field} must use YYYY-MM-DD format`, 400);
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new AppError(`${field} is not a valid date`, 400);
    }

    return date;
  }
}