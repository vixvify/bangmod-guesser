import { Role as PrismaRole } from "@prisma/client";
import {
  UserRole,
  type User,
  type UserAccount,
} from "@/core/domain/user";
import type { UserModel } from "../../prisma/types/user";

const roleMap: Record<PrismaRole, UserRole> = {
  [PrismaRole.USER]: UserRole.USER,
  [PrismaRole.ADMIN]: UserRole.ADMIN,
};

interface UserAccountSource {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  banReason?: string | null;
  banExpires?: Date | null;
}

interface UserAccountMetadata {
  status: UserAccount["status"];
  gameCount: number;
}

export const UserFactory = {
  public(user: UserModel): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleMap[user.role],
    };
  },

  toAccount(
    user: UserAccountSource,
    metadata: UserAccountMetadata,
  ): UserAccount {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      role:
        user.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER,
      status: metadata.status,
      gameCount: metadata.gameCount,
      suspension: {
        startDate: null,
        endDate:
          metadata.status === "SUSPENDED" &&
          user.banExpires ? user.banExpires.toISOString() : null,
      },
      reason: user.banReason ?? "",
    };
  },
};