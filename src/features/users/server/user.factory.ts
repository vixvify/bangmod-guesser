import { Role as PrismaRole } from "@prisma/client";
import {
  UserRole,
  type User,
  type UserAccount,
} from "@/features/users/user";
import type { UserModel, UserModelWithGameCount } from "../../../../prisma/types/user";
import { formatDateOnly } from "@/shared/lib/utils";

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
          user.banExpires ? formatDateOnly(user.banExpires) : null,
      },
      reason: user.banReason ?? "",
    };
  },
};
