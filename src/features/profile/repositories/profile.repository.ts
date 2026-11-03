import type { Prisma } from "@prisma/client";
import type { ProfileHistoryFilter } from "../domain/profile";
import type { ProfileRepository } from "../ports/profile.repository";
import { profileGameSelect, profileUserSelect, type GetProfileRecordsResult } from "../../../../prisma/types/profile";
import { prisma } from "@/shared/lib/prisma";

const completedGameWhere = {
  status: "COMPLETED",
  totalScore: { not: null },
} satisfies Prisma.GameWhereInput;

export class ProfileRepositoryImpl implements ProfileRepository {
  async findProfile(userId: string, filter: ProfileHistoryFilter): Promise<GetProfileRecordsResult> {
    const dateFilter: Prisma.GameWhereInput = {
      ...completedGameWhere,
      ...(filter.from || filter.toExclusive
        ? {
            startedAt: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.toExclusive ? { lt: filter.toExclusive } : {}),
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
            orderBy: [{ startedAt: "desc" }, { id: "desc" }],
            skip: (filter.page - 1) * filter.pageSize,
            take: filter.pageSize,
            select: profileGameSelect,
          },
        },
      }),
      prisma.game.count({ where: { userId, ...dateFilter } }),
    ]);

    return { user, totalGames };
  }
}
