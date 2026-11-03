import "server-only";
import { headers } from "next/headers";
import { UserRole, type User } from "@/features/users/domain/user";
import { AppError } from "@/shared/errors/app.error";
import { auth } from "@/features/auth/lib/auth";

export async function authCheck(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const role = (session.user as { role?: string }).role;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER,
  };
}

export async function requireAuth(): Promise<User> {
  const user = await authCheck();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  return user;
}

