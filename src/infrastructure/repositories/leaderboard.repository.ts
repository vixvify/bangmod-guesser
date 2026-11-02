import type { Prisma } from "@prisma/client";
import type {
  LeaderboardRepository,
  LeaderboardUserRecord,
  ProfileDateFilter,
  ProfileRecordsResult,
} from "@/core/ports/leaderboard.repository";
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
      select: {
        id: true,
        name: true,
        games: {
          where: completedGameWhere,
          select: {
            totalScore: true,
          },
        },
      },
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
          id: true,
          name: true,
          email: true,
          games: {
            where: dateFilter,
            orderBy: {
              startedAt: "desc",
            },
            skip: (filter.page - 1) * filter.pageSize,
            take: filter.pageSize,
            select: {
              id: true,
              status: true,
              startedAt: true,
              totalScore: true,
              rounds: {
                where: {
                  guessedLatitude: { not: null },
                  guessedLongitude: { not: null },
                },
                select: {
                  questionNumber: true,
                  guessedLatitude: true,
                  guessedLongitude: true,
                  score: true,
                  location: {
                    select: {
                      latitude: true,
                      longitude: true,
                    },
                  },
                },
              },
            },
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