import type { ZodSchema } from "zod";
import { AppError } from "@/core/errors/app.error";

export function parseSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0]?.message || "Validation failed",
      400,
    );
  }

  return result.data;
}
