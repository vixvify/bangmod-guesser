import { APIError } from "better-auth/api";
import { AppError } from "@/shared/errors/app.error";

export function handleAuthError(error: unknown, message: string): never {
  if (error instanceof APIError) {
    throw new AppError(
      message,
      error.statusCode,
      typeof error.body?.code === "string" ? error.body.code : undefined
    );
  }
  throw error;
}
