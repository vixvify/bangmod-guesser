import { Role as PrismaRole } from "@prisma/client";
import {
  UserRole,
  type User,
  type UserAccount,
} from "@/features/users/user";
import type { UserModel, UserModelWithGameCount } from "../../../../prisma/types/user";
import { formatDateOnly } from "@/shared/lib/utils";
import { getUserStatus } from "@/shared/lib/user-status";

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
    const status = getUserStatus(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: roleMap[user.role],
      status,
      gameCount: user._count.games,
      suspension: {
        startDate: null,
        endDate:
          status === "SUSPENDED" && user.banExpires
            ? formatDateOnly(user.banExpires)
            : null,
      },
      reason: user.banReason ?? "",
    };
  },
};
