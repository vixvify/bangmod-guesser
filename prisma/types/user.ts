import type { Prisma, User as PrismaUser } from "@prisma/client";

export type UserModel = PrismaUser;

export type UserModelWithGameCount = Prisma.UserGetPayload<{
  include: { _count: { select: { games: true } } };
}>;

export type GetUserRecordsResult = {
  items: UserModelWithGameCount[];
  total: number;
};
