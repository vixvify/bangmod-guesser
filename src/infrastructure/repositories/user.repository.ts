import type { Prisma } from "@prisma/client";
import type { UserRepository } from "@/core/ports/user.repository";
import type { SearchUserQuery } from "@/core/schema/user.schema";
import type { UserStatus } from "@/core/domain/user";
import type {
  GetUserRecordsResult,
  UserModelWithGameCount,
} from "../../../prisma/types/user";
import { prisma } from "@/lib/prisma";

const withGameCount = { _count: { select: { games: true } } } as const;

export class UserRepositoryImpl implements UserRepository {
  async findMany(query: SearchUserQuery): Promise<GetUserRecordsResult> {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
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

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    await prisma.user.update({ where: { id }, data: { status } });
  }
}
