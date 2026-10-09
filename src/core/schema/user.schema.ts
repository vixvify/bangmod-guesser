import { z } from "zod";
import type { UserStatus } from "@/core/domain/user";
import { UserRole } from "@/core/domain/user";
import { UpdateUsernameSchema } from "@/core/schema/profile.schema";
import { USER_MESSAGES } from "@/core/constants/user";

export const UserIdSchema = z
  .string()
  .trim()
  .min(1, "User ID is required");

export const SearchUserQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(9),

  role: z
    .enum(UserRole)
    .optional(),

  status: z
    .enum([
      "ACTIVE",
      "SUSPENDED",
      "INACTIVE",
    ] satisfies UserStatus[])
    .optional(),
});

export type SearchUserQuery = z.infer<typeof SearchUserQuerySchema>;

export const UserFormSchema = z
  .object({
    name: UpdateUsernameSchema,
    role: z.enum(UserRole),
    status: z.enum([
      "ACTIVE",
      "SUSPENDED",
      "INACTIVE",
    ] satisfies UserStatus[]),
    suspension: z.object({
      startDate: z.iso.date().nullable(),
      endDate: z.iso.date().nullable(),
    }),
    reason: z.string().trim().max(200, USER_MESSAGES.reasonMax),
  });

export type UserFormInput = z.input<typeof UserFormSchema>;
