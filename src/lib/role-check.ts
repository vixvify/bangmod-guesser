import type { User } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";

export function roleCheck(user: User, allowedRoles: string[]): User {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError("Forbidden", 403);
  }

  return user;
}
