import { Role as PrismaRole, UserStatus } from "@prisma/client";
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
    emailVerified: false,
    image: null,
    role: PrismaRole.USER,
    banned: false,
    banReason: null,
    banExpires: null,
    status: UserStatus.ACTIVE,
    suspendedUntil: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

