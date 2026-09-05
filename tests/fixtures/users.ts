import type { UserModel } from "../../prisma/types/user";

export const validRegistration = {
  name: "KMUTT Student",
  email: "student@example.com",
  password: "Password123",
  confirmPassword: "Password123",
};

export const validLogin = {
  email: validRegistration.email,
  password: validRegistration.password,
};

export function createUserModel(overrides: Partial<UserModel> = {}): UserModel {
  return {
    id: "user_1",
    name: validRegistration.name,
    email: validRegistration.email,
    password: "scrypt:salt:hash",
    roleId: "role_user",
    role: {
      id: "role_user",
      name: "USER",
    },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
