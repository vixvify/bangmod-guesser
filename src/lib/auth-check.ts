import "server-only";
import { cookies } from "next/headers";
import type { User } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import { sessionService } from "@/infrastructure/container";

export async function authCheck(): Promise<User | null> {
  const token = (await cookies()).get("accessToken")?.value ?? null;
  return sessionService.getCurrentUser(token);
}

export async function requireAuth(): Promise<User> {
  const user = await authCheck();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  return user;
}
