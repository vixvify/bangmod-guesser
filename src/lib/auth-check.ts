import "server-only";
import { headers } from "next/headers";
import { UserRole, type User } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import { auth } from "@/lib/auth";

export async function authCheck(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER,
  };
}

export async function requireAuth(): Promise<User> {
  const user = await authCheck();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  return user;
}
