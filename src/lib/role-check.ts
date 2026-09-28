import { UserRole, type User } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";

export function hasRole(
  user: User | null,
  allowedRoles: readonly UserRole[],
): user is User {
  return user !== null && allowedRoles.includes(user.role);
}

export function roleCheck(
  user: User,
  allowedRoles: readonly UserRole[],
): User {
  if (!hasRole(user, allowedRoles)) {
    throw new AppError("Forbidden", 403);
  }

  return user;
}
