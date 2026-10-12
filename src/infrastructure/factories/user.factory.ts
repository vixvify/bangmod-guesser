import { Role as PrismaRole } from "@prisma/client";
import {
  UserRole,
  type User,
  type UserAccount,
} from "@/core/domain/user";
import type { UserModel, UserModelWithGameCount } from "../../../prisma/types/user";

const roleMap: Record<PrismaRole, UserRole> = {
  [PrismaRole.USER]: UserRole.USER,
  [PrismaRole.ADMIN]: UserRole.ADMIN,
};

export const UserFactory = {
  public(user: UserModel): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleMap[user.role],
    };
  },

  toAccount(user: UserModelWithGameCount): UserAccount {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: roleMap[user.role],
      status: user.status,
      gameCount: user._count.games,
      suspension: {
        startDate: null,
        endDate:
          user.status === "SUSPENDED" &&
          user.banExpires ? user.banExpires.toISOString().slice(0, 10) : null,
      },
      reason: user.banReason ?? "",
    };
  },
};
