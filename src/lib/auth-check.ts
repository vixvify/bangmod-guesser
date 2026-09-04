import "server-only";
import { cookies } from "next/headers";
import { AppError } from "@/core/errors/app.error";
import { sessionService } from "@/infrastructure/container";

export async function authCheck() {
  const token = (await cookies()).get("accessToken")?.value ?? null;
  const user = await sessionService.getCurrentUser(token);

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  return user;
}
