import type { User } from "@/core/domain/user";
import type { UserModel } from "../../../prisma/types/user";

export const UserFactory = {
  public(user: UserModel): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };
  },
};
