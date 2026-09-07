import { Role as PrismaRole } from "@prisma/client";
import { UserRole, type User } from "@/core/domain/user";
import type { UserModel } from "../../../prisma/types/user";

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
};
