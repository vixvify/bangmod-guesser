import type { User } from "@/core/domain/user";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
};

export const UserFactory = {
  fromRecord(user: UserRecord): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    };
  },

  withPassword(user: UserRecord & { password: string }): User & {
    password: string;
  } {
    return {
      ...this.fromRecord(user),
      password: user.password,
    };
  },

  public(user: User): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
};
