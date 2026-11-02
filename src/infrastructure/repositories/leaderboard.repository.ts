import type { Prisma } from "@prisma/client";
import type {
  LeaderboardRepository,
  ProfileDateFilter,
  ProfileRecordsResult,
} from "@/core/ports/leaderboard.repository";
import {
  leaderboardUserSelect,
  profileGameSelect,
  profileUserSelect,
  type LeaderboardUserRecord,
} from "../../../prisma/types/leaderboard";
import { prisma } from "@/lib/prisma";

const completedGameWhere = {
  status: "COMPLETED",
  totalScore: { not: null },
} satisfies Prisma.GameWhereInput;

export class LeaderboardRepositoryImpl implements LeaderboardRepository {
  async findLeaderboardUsers(): Promise<LeaderboardUserRecord[]> {
    return prisma.user.findMany({
      where: {
        games: {
          some: completedGameWhere,
        },
      },
      select: leaderboardUserSelect,
    });
  }

  async findProfile(
    userId: string,
    filter: ProfileDateFilter,
  ): Promise<ProfileRecordsResult> {
    const dateFilter: Prisma.GameWhereInput = {
      ...completedGameWhere,
      ...(filter.from || filter.toExclusive
        ? {
            startedAt: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.toExclusive
                ? { lt: filter.toExclusive }
                : {}),
            },
          }
        : {}),
    };

    const [user, totalGames] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          ...profileUserSelect,
          games: {
            where: dateFilter,
            orderBy: {
              startedAt: "desc",
            },
            skip: (filter.page - 1) * filter.pageSize,
            take: filter.pageSize,
            select: profileGameSelect,
          },
        },
      }),
      prisma.game.count({
        where: {
          userId,
          ...dateFilter,
        },
      }),
    ]);

    return {
      user,
      totalGames,
    };
  }
}