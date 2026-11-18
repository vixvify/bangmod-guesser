import type { Prisma } from "@prisma/client";
import type { UserRepository } from "@/features/users/server/user.repository.port";
import type { SearchUserQuery } from "@/features/users/user.schema";
import type {
  GetUserRecordsResult,
  UserModelWithGameCount,
} from "../../../../prisma/types/user";
import { prisma } from "@/shared/lib/prisma";

const withGameCount = { _count: { select: { games: true } } } as const;

export class UserRepositoryImpl implements UserRepository {
  async findMany(query: SearchUserQuery): Promise<GetUserRecordsResult> {
    const now = new Date();
    const statusWhere: Prisma.UserWhereInput =
      query.status === "ACTIVE"
        ? {
            OR: [
              { banned: false },
              { banned: true, banExpires: { lte: now } },
            ],
          }
        : query.status === "SUSPENDED"
          ? {
              banned: true,
              OR: [
                { banExpires: null },
                { banExpires: { gt: now } },
              ],
            }
          : {};

    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...statusWhere,
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: withGameCount,
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<UserModelWithGameCount | null> {
    return prisma.user.findUnique({ where: { id }, include: withGameCount });
  }

  async findBanExpiryByEmail(email: string): Promise<Date | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { banExpires: true },
    });
    return user?.banExpires ?? null;
  }
}
